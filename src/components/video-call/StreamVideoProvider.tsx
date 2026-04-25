import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamTheme,
  useCalls,
  StreamCall,
  CallControls,
  CallingState,
  useCallStateHooks,
  RingingCall,
  useCall,
  ParticipantView
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { chatService } from '@services/api/chat/chat.service';

const apiKey = import.meta.env.VITE_STREAM_API_KEY as string;

const useCallRingtone = (enabled: boolean, isOutgoing: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: number | undefined;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    const playNote = (
      audioContext: AudioContext,
      frequency: number,
      startTime: number,
      duration: number,
      volume: number
    ) => {
      const oscillator = audioContext.createOscillator();
      const overtone = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.type = 'sine';
      overtone.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      overtone.frequency.setValueAtTime(frequency * 2.01, startTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.connect(filter);
      overtone.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(startTime);
      overtone.start(startTime);
      oscillator.stop(startTime + duration + 0.03);
      overtone.stop(startTime + duration + 0.03);
    };

    const playTone = async () => {
      if (!AudioContextClass) return;

      try {
        const audioContext = audioContextRef.current || new AudioContextClass();
        audioContextRef.current = audioContext;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const now = audioContext.currentTime + 0.02;
        const melody = isOutgoing
          ? [
              { frequency: 392, delay: 0, duration: 0.2, volume: 0.055 },
              { frequency: 494, delay: 0.23, duration: 0.22, volume: 0.065 },
              { frequency: 587, delay: 0.5, duration: 0.28, volume: 0.055 }
            ]
          : [
              { frequency: 659, delay: 0, duration: 0.18, volume: 0.075 },
              { frequency: 784, delay: 0.2, duration: 0.2, volume: 0.085 },
              { frequency: 988, delay: 0.43, duration: 0.22, volume: 0.075 },
              { frequency: 784, delay: 0.72, duration: 0.24, volume: 0.065 }
            ];

        melody.forEach(({ frequency, delay, duration, volume }) => {
          playNote(audioContext, frequency, now + delay, duration, volume);
        });
      } catch (error) {
        window.clearInterval(intervalId);
      }
    };

    playTone();
    intervalId = window.setInterval(playTone, isOutgoing ? 2100 : 1700);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, isOutgoing]);
};

const isLocalParticipant = (participant: any) => participant?.isLocalParticipant || participant?.isLocal;

const getParticipantName = (participant: any) => {
  if (isLocalParticipant(participant)) return 'You';
  return participant?.name || participant?.user?.name || participant?.userId || 'Guest';
};

const getParticipantImage = (participant: any) => participant?.image || participant?.user?.image || '';

const ParticipantTile = ({ participant }: { participant: any }) => {
  const name = getParticipantName(participant);
  const image = getParticipantImage(participant);

  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-[#151b27] shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <ParticipantView
        participant={participant}
        className="h-full min-h-[260px] w-full [&_.str-video__video-placeholder]:h-full [&_.str-video__video]:h-full [&_.str-video__video]:w-full [&_.str-video__video]:object-cover"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/70 via-black/30 to-transparent px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-sm font-black text-white">
            {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-[14px] font-black text-white">{name}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
              {isLocalParticipant(participant) ? 'Local camera' : 'Remote participant'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WaitingParticipantTile = ({ member }: { member: any }) => {
  const user = member?.user || {};
  const name = user?.name || 'Waiting';

  return (
    <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-white/15 bg-[#111722] shadow-[0_22px_70px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-3xl font-black text-white">
          {user?.image ? <img src={user.image} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
        </div>
        <p className="text-[16px] font-black text-white">{name}</p>
        <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.16em] text-white/40">Waiting to join</p>
      </div>
    </div>
  );
};

const TwoPersonCallLayout = ({ participants, call, profile }: { participants: any[]; call: any; profile: any }) => {
  const sortedParticipants = [...participants].sort((a, b) => {
    if (isLocalParticipant(a)) return 1;
    if (isLocalParticipant(b)) return -1;
    return 0;
  });
  const participantIds = new Set(
    sortedParticipants.map((participant) => `${participant?.userId || participant?.user?.id}`)
  );
  const missingMembers =
    call?.state?.members?.filter((member: any) => {
      const memberId = `${member?.user?.id || member?.user_id || ''}`;
      return memberId && memberId !== `${profile?._id}` && !participantIds.has(memberId);
    }) || [];
  const tiles = [
    ...sortedParticipants,
    ...missingMembers.map((member: any) => ({ member, isWaitingTile: true }))
  ].slice(0, 2);

  return (
    <div className={`grid h-full w-full gap-4 ${tiles.length > 1 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
      {tiles.map((tile: any, index: number) =>
        tile.isWaitingTile ? (
          <WaitingParticipantTile key={`waiting-${tile.member?.user?.id || index}`} member={tile.member} />
        ) : (
          <ParticipantTile key={tile.sessionId || tile.userId || index} participant={tile} />
        )
      )}
    </div>
  );
};

// Sub-component to listen to active calls and render them
const CallUIWrapper = ({ children }: { children: ReactNode }) => {
  const calls = useCalls();

  // Lọc lấy cuộc gọi đang ở trạng thái hoạt động
  const activeCall = calls.find(
    (c) => c.state.callingState !== CallingState.IDLE && c.state.callingState !== CallingState.LEFT
  );

  return (
    <>
      <div className="stream-app-wrapper fixed inset-0 pointer-events-none z-9999 flex items-center justify-center">
        {activeCall && (
          <StreamCall call={activeCall}>
            <ActiveCallView />
          </StreamCall>
        )}
      </div>
      {children}
    </>
  );
};

const CallHeader = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const remoteParticipant = participants.find((participant) => !isLocalParticipant(participant));

  return (
    <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-10000 pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto bg-black/40 backdrop-blur-xl p-3.5 px-5 rounded-2xl border border-white/10 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
          {remoteParticipant ? (
            getParticipantImage(remoteParticipant) ? (
              <img src={getParticipantImage(remoteParticipant)} alt="participant" className="w-full h-full object-cover" />
            ) : (
              getParticipantName(remoteParticipant).charAt(0)
            )
          ) : (
            'U'
          )}
        </div>
        <div>
          <p className="text-white font-bold text-[15px] leading-tight tracking-wide">
            {remoteParticipant?.name || 'Private Chat'}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
            <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Secure Connection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveCallView = () => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const call = useCall();
  const { profile } = useSelector((state: RootState) => state.user);
  const isRinging = callingState === CallingState.RINGING;

  useCallRingtone(isRinging && Boolean(call && profile), Boolean(call?.isCreatedByMe));

  if (!call || !profile) return null;

  if (callingState === CallingState.RINGING) {
    const isCreatedByMe = call.isCreatedByMe;

    return (
      <div className="pointer-events-auto bg-[#1c1f2e] dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.7)] overflow-hidden scale-110 transform transition-all min-w-[360px] border border-white/5">
        {isCreatedByMe ? (
          <div className="p-10 flex flex-col items-center gap-8 text-white text-center bg-linear-to-b from-primary/10 to-transparent">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-22 h-22 rounded-full overflow-hidden bg-gray-700 ring-4 ring-[#1c1f2e]">
                  {call.state.members.find((m) => m.user.id !== String(profile._id))?.user.image ? (
                    <img
                      src={call.state.members.find((m) => m.user.id !== String(profile._id))?.user.image}
                      alt="receiver"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-3xl font-bold">
                      {call.state.members.find((m) => m.user.id !== String(profile._id))?.user.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Calling...</h3>
              <p className="text-gray-400 font-medium italic">Waiting for an answer</p>
            </div>
            <button
              onClick={() => call?.endCall()}
              className="bg-red-500 hover:bg-red-600 w-16 h-16 flex items-center justify-center rounded-full text-white transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
            >
              <svg className="w-8 h-8 rotate-135" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="incoming-call-wrapper scale-105 p-2">
            <RingingCall />
          </div>
        )}
      </div>
    );
  }

  if (callingState === CallingState.JOINING) {
    return (
      <div className="pointer-events-auto bg-[#0a0b14] p-12 rounded-[2rem] flex flex-col items-center gap-6 text-white shadow-2xl border border-white/5">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent animate-spin rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]" />
        <p className="font-bold text-xl animate-pulse">Establishing Connection...</p>
        <p className="text-sm text-gray-400">Please ensure you have granted camera and microphone permissions.</p>
      </div>
    );
  }

  if (callingState === CallingState.JOINED) {
    return (
      <div className="fixed inset-0 bg-[#07080c] flex flex-col z-9999 pointer-events-auto overflow-hidden font-sans">
        {/* Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />

        <CallHeader />

        <div className="relative h-full w-full flex-1 px-4 pb-36 pt-24 md:px-8">
          <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] border border-white/10 bg-black/25 p-4 shadow-2xl backdrop-blur-sm">
            <TwoPersonCallLayout participants={participants} call={call} profile={profile} />

            {/* Overlay thông báo nếu không có quyền hoặc lỗi kết nối */}
            {participants.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-6 text-center">
                <div className="max-w-md space-y-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/50">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Action Required</h2>
                  <p className="text-gray-300">
                    We can't access your camera or audio. Please click the <b>lock icon</b> in your browser address bar
                    and select <b>"Allow"</b> for Camera & Microphone.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary rounded-xl font-bold text-white hover:bg-primary/80 transition-colors"
                  >
                    I've granted permissions, Reload!
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:bg-white/10">
          <CallControls onLeave={() => call?.endCall()} />
        </div>
      </div>
    );
  }

  return null;
};

export const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { profile } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!profile || !apiKey) return;

    let client: StreamVideoClient;

    const initVideoClient = async () => {
      client = new StreamVideoClient({
        apiKey,
        user: {
          id: profile._id as string,
          name: profile.username || 'User',
          image: profile.profilePicture || ''
        },
        tokenProvider: async () => {
          const { data } = await chatService.getVideoToken();
          return data.token;
        }
      });

      setVideoClient(client);
    };

    initVideoClient();

    return () => {
      if (client) {
        client.disconnectUser();
        setVideoClient(null);
      }
    };
  }, [profile?._id]);

  if (!videoClient) return <>{children}</>;

  return (
    <StreamVideo client={videoClient}>
      <StreamTheme>
        <CallUIWrapper>{children}</CallUIWrapper>
      </StreamTheme>
    </StreamVideo>
  );
};
