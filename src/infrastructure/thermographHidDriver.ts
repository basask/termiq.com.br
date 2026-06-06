/**
 * Thermograph WebHID Protocol Driver
 *
 * Same protocol as ThermographDriver (thermographDriver.ts) but transported
 * over the WebHID API instead of WebUSB.  WebHID avoids the "protected class"
 * restriction that blocks WebUSB on HID-class devices.
 *
 * Transport : WebHID, vendor usage page 0xFFA0, 32-byte interrupt endpoints
 * I/O model : sendReport(0, …) for output, inputreport event for input
 */

import type { DeviceInfo, FetchedRecord, IThermographDriver, RecordEntry } from './thermographDriver'

// ── constants ─────────────────────────────────────────────────────────────────

const PROTO = 0x52
const MARK_CMD = 0xaa
const MARK_RSP = 0x55
const BOOKEND_CMD = 0x55
const BOOKEND_RSP = 0xaa

const CMD_PING = 0x00
const CMD_CONFIG = 0x01
const CMD_LIST = 0x02
const CMD_FETCH = 0x03
const CMD_GET_DATE = 0x05
const CMD_GET_TIME = 0x06
const CMD_STATUS = 0x09
const CMD_INTERVAL = 0x0a
const CMD_REC_DATE = 0x0c
const CMD_REC_TIME = 0x0d
const CMD_REC_COUNT = 0x0e

// ── helpers ───────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0')
const pad2 = (n: number) => String(n).padStart(2, '0')

// ── driver class ──────────────────────────────────────────────────────────────

export class ThermographHidDriver implements IThermographDriver {
  private inputQueue: Uint8Array[] = []
  private inputWaiters: ((data: Uint8Array) => void)[] = []

  constructor(private readonly device: HIDDevice) {}

  // ── connection ──────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    if (!this.device.opened) await this.device.open()
    this.device.addEventListener('inputreport', this.onInputReport)

    // HID SET_REPORT (output) — same device-specific init payload as WebUSB path
    const initPayload = new Uint8Array(32)
    initPayload.set([0xff, 0xc7, 0x83, 0xcc, 0x10, 0x00, 0x00, 0x00])
    await this.device.sendReport(0, initPayload)

    await delay(50)
  }

  async close(): Promise<void> {
    this.device.removeEventListener('inputreport', this.onInputReport)
    this.inputQueue = []
    // Reject any pending recv() promises to avoid memory leaks
    const pending = this.inputWaiters.splice(0)
    for (const reject of pending) reject(new Uint8Array(0))
    try { await this.device.close() } catch { /* ignore */ }
  }

  // ── low-level I/O ────────────────────────────────────────────────────────────

  // Arrow property so `this` is always bound when used as an event listener
  private onInputReport = (event: HIDInputReportEvent): void => {
    const data = new Uint8Array(event.data.buffer)
    const waiter = this.inputWaiters.shift()
    if (waiter) {
      waiter(data)
    } else {
      this.inputQueue.push(data)
    }
  }

  private buildCmd(cmdId: number, p1 = 0, p2 = 0, p3 = 0): Uint8Array {
    const pkt = new Uint8Array(32)
    pkt[0] = 0x07; pkt[1] = MARK_CMD; pkt[2] = PROTO
    pkt[3] = cmdId; pkt[4] = p1; pkt[5] = p2; pkt[6] = p3
    pkt[7] = BOOKEND_CMD
    return pkt
  }

  private parseSimpleResponse(data: Uint8Array): [number, [number, number, number]] | null {
    if (data.length < 8) return null
    if (data[1] !== MARK_RSP || data[2] !== PROTO) return null
    return [data[3], [data[4], data[5], data[6]]]
  }

  private async send(data: Uint8Array): Promise<void> {
    await this.device.sendReport(0, data)
  }

  // Converts event-driven inputreport into a pull-based recv() for the protocol loop
  private recv(): Promise<Uint8Array> {
    if (this.inputQueue.length > 0) return Promise.resolve(this.inputQueue.shift()!)
    return new Promise<Uint8Array>((resolve) => this.inputWaiters.push(resolve))
  }

  private async cmd(cmdId: number, p1 = 0, p2 = 0, p3 = 0): Promise<[number, number, number]> {
    await this.send(this.buildCmd(cmdId, p1, p2, p3))
    await delay(20)
    const raw = await this.recv()
    const parsed = this.parseSimpleResponse(raw)
    if (!parsed || parsed[0] !== cmdId) {
      throw new Error(`Unexpected response for cmd 0x${hex2(cmdId)}: ${Array.from(raw).map(hex2).join(' ')}`)
    }
    return parsed[1]
  }

  // ── public commands ──────────────────────────────────────────────────────────

  async ping(): Promise<[number, number, number]> {
    return this.cmd(CMD_PING)
  }

  async getDate(): Promise<string> {
    const b = await this.cmd(CMD_GET_DATE)
    return `${2000 + b[0]}-${pad2(b[1])}-${pad2(b[2])}`
  }

  async getTime(): Promise<string> {
    const b = await this.cmd(CMD_GET_TIME)
    return `${pad2(b[0])}:${pad2(b[1])}:${pad2(b[2])}`
  }

  async getSamplingInterval(): Promise<number> {
    const b = await this.cmd(CMD_INTERVAL)
    return b[2]
  }

  async getNumChannels(): Promise<number> {
    const b = await this.cmd(CMD_CONFIG, 0x04)
    return b[0]
  }

  async getTotalDatapoints(): Promise<number> {
    const b = await this.cmd(CMD_REC_COUNT, 0x12, 0x34, 0x56)
    return (b[0] << 8) | b[1]
  }

  async getStatus(): Promise<string> {
    const b = await this.cmd(CMD_STATUS)
    return `${hex2(b[0])} ${hex2(b[1])} ${hex2(b[2])}`
  }

  async getInfo(): Promise<DeviceInfo> {

    console.log(`[HID] getInfo::start`);

    const idBytes = await this.ping()
    const modelHint = [idBytes[0], idBytes[1]]
      .filter((b) => b >= 0x20 && b < 0x7f)
      .map((b) => String.fromCharCode(b))
      .join('')

    console.log(`[HID] getInfo::end modelHint=${modelHint}`);

    return {
      modelHint,
      version: idBytes[2],
      clockDate: await this.getDate(),
      clockTime: await this.getTime(),
      channels: await this.getNumChannels(),
      samplingInterval: await this.getSamplingInterval(),
      totalDatapoints: await this.getTotalDatapoints(),
      statusBytes: await this.getStatus(),
    }
  }

  async listRecords(): Promise<RecordEntry[]> {
    const records: RecordEntry[] = []
    let idx = 0

    while (true) {
      const meta = await this.cmd(CMD_LIST, idx)
      if (idx > 0 && meta[1] === 0 && meta[2] === 0) break

      const dateB = await this.cmd(CMD_REC_DATE, idx)
      const timeB = await this.cmd(CMD_REC_TIME, idx)

      records.push({
        index: idx,
        startDatetime: `${2000 + dateB[0]}-${pad2(dateB[1])}-${pad2(dateB[2])} ${pad2(timeB[0])}:${pad2(timeB[1])}:${pad2(timeB[2])}`,
        meta,
      })
      console.log(`records.length=${records.length}, idx=${idx}`);
      idx++
    }

    return records
  }

  async fetchRecord(recordIdx: number, numChannels?: number): Promise<FetchedRecord> {
    const channels = numChannels ?? (await this.getNumChannels())
    const interval = await this.getSamplingInterval()
    const dateB = await this.cmd(CMD_REC_DATE, recordIdx)
    const timeB = await this.cmd(CMD_REC_TIME, recordIdx)
    const startDatetime = `${2000 + dateB[0]}-${pad2(dateB[1])}-${pad2(dateB[2])} ${pad2(timeB[0])}:${pad2(timeB[1])}:${pad2(timeB[2])}`

    await this.send(this.buildCmd(CMD_FETCH, recordIdx))
    await delay(20)

    const rawStream: number[] = []
    let firstPacket = true

    while (true) {
      const pkt = await this.recv()
      const pktLen = pkt[0]
      const payload = pkt.slice(1, 1 + pktLen)

      let dataBytes: Uint8Array

      if (firstPacket) {
        if (payload.length < 5 || payload[0] !== MARK_RSP || payload[1] !== PROTO || payload[2] !== CMD_FETCH) {
          throw new Error(`Bad fetch response header: ${Array.from(pkt).map(hex2).join(' ')}`)
        }
        dataBytes = payload.slice(5)
        firstPacket = false
      } else {
        dataBytes = payload
      }

      const endPos = Array.from(dataBytes).indexOf(BOOKEND_RSP)
      if (endPos >= 0) {
        rawStream.push(...Array.from(dataBytes.slice(0, endPos)))
        break
      }
      rawStream.push(...Array.from(dataBytes))
    }

    const samples: number[][] = []
    let currentSample: number[] = []
    for (let i = 0; i + 1 < rawStream.length; i += 2) {
      currentSample.push((rawStream[i] | (rawStream[i + 1] << 8)) / 10.0)
      if (currentSample.length === channels) {
        samples.push(currentSample)
        currentSample = []
      }
    }
    if (currentSample.length > 0) samples.push(currentSample)

    return {
      entry: { index: recordIdx, startDatetime, meta: [0, 0, 0] },
      interval,
      channels,
      samples,
    }
  }
}
