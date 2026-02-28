import { Injectable } from '@nestjs/common';
import net from 'net';
import { RconResponse } from './interfaces/rcon-response.interface';

@Injectable()
export class RconService {
  async forward(
    userId: number,
    type: 1 | 2,
    roomId: string,
  ): Promise<RconResponse> {
    const data = new Map([
      ['userId', userId.toString()],
      ['type', type.toString()],
      ['roomId', roomId.toString()],
    ]);
    return this.sendRcon('forward', data);
  }

  /**
   * Sends a live hotel alert
   * @param {string} message - Message content
   * @param {string} sender - Author of the message
   */
  hotelAlert(message: string, sender = ''): Promise<RconResponse> {
    const data = new Map([['message', message]]);
    if (sender !== '') data.set('sender', sender);
    return this.sendRcon('hotel_alert', data);
  }

  /**
   * Refreshes look of a user
   * @param {int} userId - User id to refresh
   */
  refreshLooks(userId: number): Promise<RconResponse> {
    return this.refresh('looks', userId);
  }

  /**
   * Refreshes hand of a user
   * @param {int} userId - Hand's user id to refresh
   */
  refreshHand(userId: number): Promise<RconResponse> {
    return this.refresh('hand', userId);
  }

  /**
   * Refreshes credits of a user
   * @param {int} userId - Credit's user id to refresh
   */
  refreshCredits(userId: number): Promise<RconResponse> {
    return this.refresh('credits', userId);
  }

  /**
   * Refreshes club subscription of a user
   * @param {int} userId - HC Sub's user id to refresh
   */
  refreshClub(userId: number): Promise<RconResponse> {
    return this.refresh('club', userId);
  }

  refreshMotto(userId: number): Promise<RconResponse> {
    return this.refresh('motto', userId);
  }

  refreshBadge(userId: number): Promise<RconResponse> {
    return this.refresh('badge', userId);
  }

  userAlert(userId: number, message: string): Promise<RconResponse> {
    return this.sendRcon('user_alert', new Map([
      ['userId', userId.toString()],
      ['message', message],
    ]));
  }

  roomAlert(roomId: number, message: string): Promise<RconResponse> {
    return this.sendRcon('room_alert', new Map([
      ['roomId', roomId.toString()],
      ['message', message],
    ]));
  }

  disconnectUser(userId: number): Promise<RconResponse> {
    return this.sendRcon('disconnect_user', new Map([['userId', userId.toString()]]));
  }

  kickUser(userId: number): Promise<RconResponse> {
    return this.sendRcon('kick_user', new Map([['userId', userId.toString()]]));
  }

  muteUser(userId: number, minutes: number): Promise<RconResponse> {
    return this.sendRcon('mute_user', new Map([
      ['userId', userId.toString()],
      ['minutes', minutes.toString()],
    ]));
  }

  unmuteUser(userId: number): Promise<RconResponse> {
    return this.sendRcon('unmute_user', new Map([['userId', userId.toString()]]));
  }

  massEvent(roomId: number): Promise<RconResponse> {
    return this.sendRcon('mass_event', new Map([['roomId', roomId.toString()]]));
  }

  refreshCatalogue(): Promise<RconResponse> {
    return this.sendRcon('refresh_catalogue', new Map());
  }

  reloadSettings(): Promise<RconResponse> {
    return this.sendRcon('reload_settings', new Map());
  }

  shutdown(minutes: number, message?: string): Promise<RconResponse> {
    const data = new Map([['minutes', minutes.toString()]]);
    if (message) data.set('message', message);
    return this.sendRcon('shutdown', data);
  }

  shutdownCancel(message?: string): Promise<RconResponse> {
    const data = new Map<string, string>();
    if (message) data.set('message', message);
    return this.sendRcon('shutdown_cancel', data);
  }

  /**
   * Builds a RCON refresh order
   * @param refreshType - Type of the refresh order
   * @param userId - Refresh effect's user id
   * @private
   */
  private refresh(refreshType: string, userId: number): Promise<RconResponse> {
    return this.sendRcon(
      `refresh_${refreshType}`,
      new Map([['userId', userId.toString()]]),
    );
  }

  private sendRcon(
    header: string,
    parameters: Map<string, string>,
  ): Promise<RconResponse> {
    const command = this.build(header, parameters);
    const port = parseInt(process.env.RCON_PORT ?? '12309', 10);
    const host = process.env.RCON_HOST ?? '192.168.1.41';

    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const chunks: Buffer[] = [];

      socket.setTimeout(5000, () => {
        socket.destroy();
        reject(new Error('RCON timeout'));
      });

      socket.connect(port, host, () => socket.write(command));
      socket.on('data', (chunk) => chunks.push(chunk));
      socket.on('error', (err) => { socket.destroy(); reject(err); });

      socket.on('end', () => {
        socket.destroy();
        const buf = Buffer.concat(chunks);
        if (buf.length < 8) {
          reject(new Error('Invalid RCON response: too short'));
          return;
        }
        const code = buf.readInt32BE(0);
        const msgLength = buf.readInt32BE(4);
        const message = buf.subarray(8, 8 + msgLength).toString('utf8');
        resolve({ code, message });
      });
    });
  }

  private build(header: string, parameters: Map<string, string>): Buffer {
    const pack = (n: number) => {
      const b = Buffer.alloc(4);
      b.writeUInt32BE(n);
      return b;
    };

    const parts: Buffer[] = [
      pack(header.length),
      Buffer.from(header, 'ascii'),
      pack(parameters.size),
    ];

    parameters.forEach((value, key) => {
      parts.push(pack(key.length), Buffer.from(key, 'ascii'));
      parts.push(pack(value.length), Buffer.from(value, 'ascii'));
    });

    const message = Buffer.concat(parts);
    return Buffer.concat([pack(message.length), message]);
  }
}
