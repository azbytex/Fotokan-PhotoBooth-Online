import Peer, { DataConnection, MediaConnection } from 'peerjs';

export interface PeerMessage {
  type: 
    | 'START_COUNTDOWN' 
    | 'SNAP_NOW' 
    | 'PHOTO_FRAME' 
    | 'CHANGE_THEME' 
    | 'CHANGE_LAYOUT' 
    | 'REACTION' 
    | 'PARTICIPANT_READY';
  payload?: any;
}

export type MessageHandler = (msg: PeerMessage) => void;
export type StreamHandler = (remoteStream: MediaStream) => void;

export class RemoteBoothPeer {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private call: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  public peerId: string = '';

  private onMessageCallback?: MessageHandler;
  private onRemoteStreamCallback?: StreamHandler;
  private onConnectionStateChange?: (connected: boolean) => void;

  constructor(
    customId?: string,
    onMessage?: MessageHandler,
    onRemoteStream?: StreamHandler,
    onConnectionChange?: (connected: boolean) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onRemoteStreamCallback = onRemoteStream;
    this.onConnectionStateChange = onConnectionChange;

    if (typeof window !== 'undefined') {
      this.initPeer(customId);
    }
  }

  private initPeer(customId?: string) {
    try {
      this.peer = new Peer(customId || '', {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        },
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
      });

      // Handle incoming data connection
      this.peer.on('connection', (conn) => {
        this.connection = conn;
        this.setupDataConnection(conn);
      });

      // Handle incoming media call
      this.peer.on('call', (mediaCall) => {
        this.call = mediaCall;
        if (this.localStream) {
          mediaCall.answer(this.localStream);
        } else {
          // Answer without local stream if not ready
          mediaCall.answer();
        }

        mediaCall.on('stream', (remote) => {
          if (this.onRemoteStreamCallback) {
            this.onRemoteStreamCallback(remote);
          }
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS error:', err);
      });
    } catch (e) {
      console.warn('Failed to initialize PeerJS:', e);
    }
  }

  public setLocalStream(stream: MediaStream) {
    this.localStream = stream;
    // If call already active, replace track or answer
    if (this.call && this.call.peerConnection) {
      const senders = this.call.peerConnection.getSenders();
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        const vSender = senders.find((s) => s.track?.kind === 'video');
        if (vSender) vSender.replaceTrack(videoTrack);
      }
      if (audioTrack) {
        const aSender = senders.find((s) => s.track?.kind === 'audio');
        if (aSender) aSender.replaceTrack(audioTrack);
      }
    }
  }

  public connectToPeer(targetPeerId: string, stream?: MediaStream) {
    if (!this.peer) return;

    if (stream) {
      this.localStream = stream;
    }

    // 1. Establish Data connection
    const conn = this.peer.connect(targetPeerId, { reliable: true });
    this.connection = conn;
    this.setupDataConnection(conn);

    // 2. Establish Media call for live video/audio
    if (this.localStream) {
      const mediaCall = this.peer.call(targetPeerId, this.localStream);
      this.call = mediaCall;
      mediaCall.on('stream', (remoteStream) => {
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(remoteStream);
        }
      });
    }
  }

  private setupDataConnection(conn: DataConnection) {
    conn.on('open', () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(true);
      }
    });

    conn.on('data', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data as PeerMessage);
      }
    });

    conn.on('close', () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(false);
      }
    });

    conn.on('error', () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(false);
      }
    });
  }

  public sendMessage(msg: PeerMessage) {
    if (this.connection && this.connection.open) {
      this.connection.send(msg);
    }
  }

  public disconnect() {
    if (this.call) {
      this.call.close();
      this.call = null;
    }
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

