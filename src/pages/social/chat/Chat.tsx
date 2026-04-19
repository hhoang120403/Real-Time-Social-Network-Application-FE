import ChatWindow from '@components/chat/window/ChatWindow';
import ChatList from '@components/chat/list/ChatList';
import useEffectOnce from '@hooks/useEffectOnce';
import { getConversationList } from '@redux/api/chat';
import type { AppDispatch, RootState } from '@redux/store';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

const Chat = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffectOnce(() => {
    if (profile) {
      dispatch(getConversationList());
    }
  });

  const [searchParams] = useSearchParams();
  const isChatSelected = !!searchParams.get('id');

  return (
    <Box className="flex h-full flex-col overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 lg:flex-row lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-xl">
      <Box
        className={`${isChatSelected ? 'hidden lg:flex' : 'flex'} h-full w-full flex-col overflow-hidden border-r border-slate-100 bg-white lg:w-[340px] xl:w-[380px]`}
      >
        <ChatList />
      </Box>

      <Box
        className={`${isChatSelected ? 'flex' : 'hidden lg:flex'} group relative h-full min-w-0 flex-1 flex-col overflow-hidden bg-slate-50`}
      >
        {isChatSelected ? (
          <ChatWindow />
        ) : (
          <Box
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_36%)] p-8 text-center"
            data-testid="no-chat"
          >
            <Box className="absolute left-[15%] top-[20%] opacity-10 transition-all duration-1000 animate-in fade-in zoom-in">
              <svg className="h-8 w-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </Box>
            <Box className="absolute bottom-[25%] right-[20%] opacity-10 animate-in fade-in zoom-in delay-300">
              <svg className="h-10 w-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </Box>

            <Paper
              elevation={0}
              className="relative z-10 w-full max-w-[420px] rounded-3xl border border-white/70 bg-white/75 p-10 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-transform duration-500 hover:scale-[1.01]"
            >
              <Box className="mx-auto mb-8 flex h-24 w-24 rotate-6 items-center justify-center rounded-3xl bg-gradient-to-tr from-slate-950 to-blue-500 shadow-xl shadow-blue-500/20 transition-all duration-700 group-hover:rotate-0">
                <svg
                  className="h-12 w-12 -translate-x-1 translate-y-0.5 text-white drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </Box>

              <Box className="flex flex-col items-center">
                <Typography className="mb-3 text-[26px] font-black leading-tight tracking-tight text-slate-950">
                  Stay <span className="text-blue-600 italic">Connected</span>
                </Typography>
                <Typography className="mb-9 px-4 text-[15px] font-medium leading-relaxed text-slate-500">
                  Experience a new way of chatting with your friends. Safe, fast, and fun.
                </Typography>

                <Button
                  variant="contained"
                  className="group/btn relative flex w-full overflow-hidden rounded-2xl bg-slate-950 px-8 py-3.5 text-[15px] font-bold normal-case text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-900 active:scale-95"
                >
                  <span className="relative z-10">Start a Conversation</span>
                  <Box className="absolute inset-0 bg-gradient-to-r from-slate-950 to-blue-500 opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100" />
                  <svg
                    className="relative z-10 ml-3 h-5 w-5 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Box>
            </Paper>

            <Box className="absolute bottom-8 left-0 w-full select-none opacity-30">
              <Typography className="text-[12px] font-bold uppercase tracking-[10px] text-slate-400">
                Encrypted Conversations
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default Chat;
