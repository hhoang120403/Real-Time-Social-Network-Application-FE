import ChatWindow from '@components/chat/window/ChatWindow';
import ChatList from '@components/chat/list/ChatList';
import useEffectOnce from '@hooks/useEffectOnce';
import { getConversationList } from '@redux/api/chat';
import type { AppDispatch, RootState } from '@redux/store';
import { Box, Button, Paper, Typography } from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
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
        className={`${isChatSelected ? 'flex' : 'hidden lg:flex'} group relative h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f3f4f6]`}
      >
        {isChatSelected ? (
          <ChatWindow />
        ) : (
          <Box
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-10 text-center"
            data-testid="no-chat"
          >
            <Paper
              elevation={0}
              className="relative z-10 flex w-full max-w-[550px] flex-col items-center rounded-[48px] bg-white px-8 py-16 shadow-[0_20px_60px_rgba(15,23,42,0.06)] border border-transparent sm:px-16
                         animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 transition-all hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(15,23,42,0.08)]"
            >
              {/* Dual-Band Opacity Icon Container with Animations */}
              <Box className="mb-14 relative flex h-[140px] w-[140px] items-center justify-center">
                <Box className="absolute inset-0 rounded-full bg-[#ecfdf5] border-[2.5px] border-dashed border-[#a7f3d0] animate-[spin_15s_linear_infinite]" />
                <Box className="relative z-10 flex h-[95px] w-[95px] items-center justify-center rounded-full bg-[#d1fae5] transition-transform duration-500 hover:scale-110 cursor-default">
                  <GroupsRoundedIcon className="text-[52px] text-[#059669]" />
                </Box>
              </Box>

              <Box className="flex flex-col items-center">
                <Typography className="mb-5 text-[28px] font-black italic uppercase tracking-tight text-[#0f172a] sm:text-[32px] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                  World Explored
                </Typography>

                <Typography className="mb-12 max-w-[430px] px-2 text-[17px] font-medium leading-[1.65] text-slate-500 animate-in fade-in duration-700 delay-300">
                  It seems you've already connected with everyone <br className="hidden sm:block" /> available in your
                  network. Check back later for new <br className="hidden sm:block" /> suggestions!
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => dispatch(getConversationList())}
                  className="group relative overflow-hidden h-[60px] min-w-[280px] rounded-full bg-[#111827] px-10 text-[16px] font-black normal-case tracking-wide text-white shadow-[0_15px_30px_rgba(17,24,39,0.2)] transition-all hover:bg-[#1f2937] hover:shadow-[0_20px_50px_rgba(17,24,39,0.3)] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
                >
                  <Box className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Refresh Discover
                    <ExploreRoundedIcon className="text-[20px] transition-transform duration-500 group-hover:rotate-45" />
                  </span>
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default Chat;
