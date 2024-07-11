/**
 * Copyright 2022-2024 Roman Ondráček <mail@romanondracek.cz>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type AxiosResponse } from 'axios';
import { DateTime } from 'luxon';

import { ApiClient } from '@/services/ApiClient';
import {
	type Device, type DeviceAdd,
	type DeviceDetail, type DeviceModify,
	type DeviceOutputMeasurement,
	type DeviceOutputMeasurementRaw,
	type DeviceOutputMeasurements,
} from '@/types/device';

/**
 * Device service
 */
export default class DeviceService extends ApiClient {

	/**
	 * Lists all devices
	 * @return {Promise<Device[]>} List of devices
	 */
	public async list(): Promise<Device[]> {
		const devices: AxiosResponse<Device[]> = await this.getClient().get('/devices');
		return devices.data.map((device: Device) => this.deserializeDevice(device));
	}

	/**
	 * Adds a device
	 * @param {DeviceAdd} device Device to add
	 */
	public async add(device: DeviceAdd): Promise<void> {
		await this.getClient().post('/devices', device);
	}

	/**
	 * Gets a device
	 * @param {string} id Device ID
	 * @return {Promise<DeviceDetail>} Device information
	 */
	public async get(id: string): Promise<DeviceDetail> {
		const response: AxiosResponse<DeviceDetail> = await this.getClient().get(`/devices/${id}`);
		return this.deserializeDevice(response.data);
	}

	/**
	 * Edits a device
	 * @param {string} id Device ID
	 * @param {DeviceModify} device Device to edit
	 */
	public async edit(id: string, device: DeviceModify): Promise<void> {
		await this.getClient().put(`/devices/${id}`, device);
	}

	/**
	 * Deletes the device
	 * @param {string} id Device ID to delete
	 */
	public async delete(id: string): Promise<void> {
		await this.getClient().delete(`/devices/${id}`);
	}

	/**
	 * Returns the measurements of a device
	 * @param {string} id Device ID
	 * @param {string} timeRange Time range
	 * @return {Promise<DeviceOutputMeasurements[]>} Measurements
	 */
	public async getMeasurements(id: string, timeRange: string): Promise<DeviceOutputMeasurements[]> {
		const response: AxiosResponse<DeviceOutputMeasurements[]> =
			await this.getClient().get(`/devices/${id}/measurements?timeRange=${timeRange}`);
		const data: DeviceOutputMeasurements[] = response.data;
		for (const outputIndex of data.keys()) {
			const measurements = (data[outputIndex].measurements as unknown) as { current: DeviceOutputMeasurementRaw[], voltage: DeviceOutputMeasurementRaw[] };
			data[outputIndex].measurements.current = this.convertMeasurements(measurements.current);
			data[outputIndex].measurements.voltage = this.convertMeasurements(measurements.voltage);
		}
		return data;
	}

	/**
	 * Switches an output
	 * @param {string} id Device ID
	 * @param {number} output Output index
	 * @param {boolean} state Output state
	 */
	public async switchOutput(id: string, output: number, state: boolean): Promise<void> {
		await this.getClient().post(`/devices/${id}/outputs/${output}`, {
			enabled: state,
		});
	}

	/**
	 * Converts measurements to the correct format
	 * @param {DeviceOutputMeasurementRaw[]} measurements Measurements to convert
	 * @return {DeviceOutputMeasurement[]} Converted measurements
	 */
	private convertMeasurements(measurements: DeviceOutputMeasurementRaw[]): DeviceOutputMeasurement[] {
		return measurements.map((measurement: DeviceOutputMeasurementRaw): DeviceOutputMeasurement => ({
			time: DateTime.fromISO(measurement.time).toJSDate(),
			value: measurement.value,
		}));
	}


	/**
	 * Deserializes Device information from JSON
	 * @template {Device|DeviceDetail} T Device information
	 * @param {T} device Device information in JSON to deserialize
	 * @return {T} Deserialized device information
	 */
	private deserializeDevice<T extends Device|DeviceDetail>(device: T): T {
		// @ts-ignore
		device.createdAt = DateTime.fromISO(device.createdAt).toJSDate();
		// @ts-ignore
		device.lastSeen = device.lastSeen === null ? null : DateTime.fromISO(device.lastSeen).toJSDate();
		return device;
	}

}
