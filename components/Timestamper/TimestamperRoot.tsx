import React, { useContext, useEffect, useRef } from 'react';
import { AddIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Text,
  Input,
  Link,
  useColorMode,
  useDisclosure,
  Kbd,
  Image,
} from '@chakra-ui/react';
import Meta from '../Meta';
import DarkModeToggle from '../DarkModeToggle';
import { TiExport } from 'react-icons/ti';
import { TimestamperContext, TimestamperActionKind } from '../../pages';
import ExportModal from './ExportModal';
import SettingsModal from './SettingsModal';
import Timestamp from './Timestamp';
import styles from './timestamper.module.scss';
import { useCookies } from 'react-cookie';

const TimestamperRoot = () => {
  const { state, dispatch } = useContext(TimestamperContext);
  const { colorMode } = useColorMode();

  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  const videoIdRef = useRef<HTMLInputElement>(null);
  const timestampListRef = useRef<HTMLDivElement>(null);

  const [cookies, setCookie, removeCookie] = useCookies(['timestamps', 'videoId', 'timestamperSettings']);

  const updateVideoId = () => {
    try {
      var url = new URL(videoIdRef.current.value);
      var params = new URLSearchParams(url.search);

      const videoId = params.get('v');

      if (videoId) {
        setCookie('videoId', videoId, {
          path: '/',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
          sameSite: 'strict',
          secure: true,
        });
        dispatch({ type: TimestamperActionKind.SET_VIDEO_ID, payload: videoId });
      } else {
        dispatch({ type: TimestamperActionKind.SET_VIDEO_HAS_ERRORS, payload: true });
      }
    } catch (error) {
      dispatch({ type: TimestamperActionKind.SET_VIDEO_HAS_ERRORS, payload: true });
    }
  };

  const clearVideoId = () => {
    removeCookie('videoId');
    dispatch({ type: TimestamperActionKind.SET_VIDEO_ID, payload: null });
    dispatch({ type: TimestamperActionKind.SET_VIDEO_HAS_ERRORS, payload: false });
    videoIdRef.current.value = '';
    state.player.loadVideoById({ videoId: null });
  };

  const addNewTimestamp = () => {
    dispatch({ type: TimestamperActionKind.ADD_TIMESTAMP, payload: '' });
  };

  const clearTimestamps = () => {
    dispatch({ type: TimestamperActionKind.CLEAR_TIMESTAMPS, payload: null });
  };

  useEffect(() => {
    if (state.player === null) {
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window['onYouTubeIframeAPIReady'] = () => {
        dispatch({
          type: TimestamperActionKind.SET_PLAYER,
          payload: new window['YT'].Player('player', {
            height: '100%',
            width: '100%',
            playerVars: {
              playsinline: 1,
            },
            events: {
              onReady: (e) => {
                dispatch({ type: TimestamperActionKind.SET_PLAYER_READY, payload: true });
              },
            },
          }),
        });
      };
    }

    if (state.timestampList === null) {
      loadCookies();
    }
  }, []);

  useEffect(() => {
    if (state.timestampList === null) return;

    if (state.timestampList.length === 0) {
      removeCookie('timestamps');
      return;
    }

    const timestampListString = JSON.stringify(state.timestampList);
    setCookie('timestamps', timestampListString, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      sameSite: 'strict',
      secure: true,
    });
  }, [state.timestampList]);

  useEffect(() => {
    if (state.isPlayerReady && state.videoId !== null) {
      state.player.loadVideoById(state.videoId);
    }

    const handleEnterKeydown = (ev) => {
      if (ev.key === 'Enter') {
        dispatch({ type: TimestamperActionKind.ADD_TIMESTAMP, payload: '' });
      }
    };

    document.addEventListener('keydown', handleEnterKeydown);

    return () => {
      document.removeEventListener('keydown', handleEnterKeydown);
    };
  }, [state.isPlayerReady, state.videoId]);

  const loadCookies = () => {
    if (cookies.timestamps) {
      dispatch({ type: TimestamperActionKind.SET_TIMESTAMP_LIST, payload: cookies.timestamps });
    } else {
      dispatch({ type: TimestamperActionKind.SET_TIMESTAMP_LIST, payload: [] });
    }

    if (cookies.videoId) {
      videoIdRef.current.value = `https://www.youtube.com/watch?v=${cookies.videoId}`;
      dispatch({ type: TimestamperActionKind.SET_VIDEO_ID, payload: cookies.videoId });
    }

    if (cookies.timestamperSettings) {
      dispatch({ type: TimestamperActionKind.SET_TIMESTAMPER_SETTINGS, payload: cookies.timestamperSettings });
    }
  };

  return (
    <>
      <Meta title='Timestamper' description='Timestamp manager for YouTube.' img='/android-chrome-192x192.png' />
      <Container maxW='100%'>
        <Box display='flex' margin='0 auto' maxW='container.lg' justifyContent='space-between' alignItems='center'>
          <Link href='/' paddingY='0.5rem' alignItems='center' style={{ textDecoration: 'none' }} display='flex'>
            <Image boxSize='100px' src='images/timestamp.png' alt='Timestamp Logo' />
            <Heading>Timestamper</Heading>
          </Link>
          <DarkModeToggle />
        </Box>
        <Box display='flex' sx={{ gap: '0.5rem' }}>
          <Input placeholder='https://www.youtube.com/watch?v=12345' ref={videoIdRef} />
          <Button onClick={updateVideoId} colorScheme='blue'>
            Update
          </Button>
          <Button onClick={clearVideoId} colorScheme='red'>
            Clear
          </Button>
        </Box>
        {(() => {
          if (state.videoHasErrors) {
            return <Box color='red.600'>You provided an invalid link!</Box>;
          }
        })()}
        <Box display='grid' gridTemplateColumns={['1fr', '1fr', '1fr', '1fr 1fr']} gridGap='1rem' marginY='1rem'>
          <Box position='relative'>
            <Box className={styles.player} id='player'></Box>
            {(() => {
              if (state.videoId == null) {
                return (
                  <Box className={styles.playerOverlay}>
                    <Center width='100%' height='100%'>
                      <Heading
                        size='lg'
                        color='grey'
                        fontFamily='Roboto'
                        fontWeight='extrabold'
                        textTransform='uppercase'
                        userSelect='none'
                      >
                        No video link provided
                      </Heading>
                    </Center>
                  </Box>
                );
              }
            })()}
          </Box>
          <Box>
            <Box
              borderRadius='0.5rem'
              border={`1px solid ${colorMode == 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`}
              ref={timestampListRef}
              overflowY='auto'
              height='70vh'
              display='flex'
              flexDir='column'
              sx={{ gap: '0.5rem' }}
              padding='0.5rem'
            >
              {(() => {
                if (state.timestampList === null || state.timestampList.length === 0) {
                  return (
                    <Center height='100%' fontFamily='Roboto' color='grey' userSelect='none' flexDir='column'>
                      <Heading size='lg' fontFamily='Roboto' fontWeight='extrabold' textTransform='uppercase'>
                        No timestamps yet!
                      </Heading>
                      <Text>
                        Hint: You can press <Kbd>enter</Kbd> to create new timestamp!
                      </Text>
                    </Center>
                  );
                } else {
                  return state.timestampList.map((timestamp, index) => {
                    return <Timestamp key={index} timestampEvent={timestamp} />;
                  });
                }
              })()}
            </Box>
            <Box display='flex' sx={{ gap: '0.5rem' }}>
              <Button marginY='0.5rem' leftIcon={<AddIcon />} colorScheme='green' onClick={addNewTimestamp}>
                Add
              </Button>
              <Button marginY='0.5rem' leftIcon={<TiExport size='1.5rem' />} colorScheme='blue' onClick={onExportOpen}>
                Export As Text
              </Button>
              <Button marginY='0.5rem' leftIcon={<SettingsIcon />} onClick={onSettingsOpen}>
                Settings
              </Button>
              <Button marginY='0.5rem' leftIcon={<DeleteIcon />} colorScheme='red' onClick={clearTimestamps}>
                Clear
              </Button>
              <iframe
                src={`/external/kofi.html`}
                style={{ border: 'none', marginBlock: '0.5rem', height: '40px' }}
              ></iframe>
            </Box>
          </Box>
        </Box>
      </Container>
      <ExportModal isOpen={isExportOpen} onClose={onExportClose} />
      <SettingsModal isOpen={isSettingsOpen} onClose={onSettingsClose} />
    </>
  );
};

export default TimestamperRoot;
