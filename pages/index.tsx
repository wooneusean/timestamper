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
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { TiExport } from 'react-icons/ti';
import DarkModeToggle from '../components/DarkModeToggle';
import ExportModal from '../components/Timestamper/ExportModal';
import SettingsModal from '../components/Timestamper/SettingsModal';
import Timestamp from '../components/Timestamper/Timestamp';
import Meta from '../components/Meta';
import styles from './timestamper.module.scss';

export interface TimestampTime {
  actualSeconds: number;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface TimestampEvent {
  timestamp: TimestampTime;
  event: string;
}

export interface TimestamperSettings {
  timeOffset: number;
}

const Home = () => {
  const [timestampList, setTimestampList] = useState<TimestampEvent[]>(null);
  const [videoIdHasErrors, setVideoIdHasErrors] = useState(false);
  const [player, setPlayer] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [timestamperSettings, setTimestamperSettings] = useState<TimestamperSettings>({ timeOffset: 5 });
  const [addNewTimestamp, setNewTimestamp] = useState<() => void>(() => {});

  const videoIdRef = useRef<HTMLInputElement>(null);
  const timestampListRef = useRef<HTMLDivElement>(null);

  const [cookies, setCookie, removeCookie] = useCookies(['timestamps', 'videoId', 'timestamperSettings']);

  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!player) {
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window['onYouTubeIframeAPIReady'] = () => {
        setPlayer(
          new window['YT'].Player('player', {
            height: '100%',
            width: '100%',
            playerVars: {
              playsinline: 1,
            },
            events: {
              onReady: (e) => {
                setIsPlayerReady(true);
              },
            },
          })
        );
      };
    }

    if (timestampList === null) {
      loadCookies();
    }
  }, []);

  useEffect(() => {
    if (videoId == null) {
      removeCookie('videoId');
      return;
    }

    const videoIdString = JSON.stringify(videoId);
    setCookie('videoId', videoIdString, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      sameSite: 'strict',
      secure: true,
    });

    if (videoId && isPlayerReady) {
      player.loadVideoById({ videoId });
    }
  }, [videoId, player, isPlayerReady]);

  useEffect(() => {
    timestampListRef.current.scrollTop = timestampListRef.current.scrollHeight;

    setNewTimestamp(() => () => {
      if (player && videoId) {
        const timestamp = secondsToTimestamp(player.getCurrentTime() - timestamperSettings.timeOffset);

        setTimestampList([...(timestampList ?? []), { timestamp, event: '' }]);
      }
    });
  }, [player, timestampList, videoId, timestamperSettings]);

  useEffect(() => {
    if (timestampList !== null) {
      if (timestampList.length === 0) {
        removeCookie('timestamps');
        return;
      }

      const timestampListString = JSON.stringify(timestampList);
      setCookie('timestamps', timestampListString, {
        path: '/',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        sameSite: 'strict',
        secure: true,
      });
    }
  }, [timestampList]);

  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === 'Enter') {
        addNewTimestamp();
      }
    };

    window.addEventListener('keydown', handleEnterKey);

    return () => {
      window.removeEventListener('keydown', handleEnterKey);
    };
  }, [addNewTimestamp]);

  useEffect(() => {
    const timestamperSettingsString = JSON.stringify(timestamperSettings);
    setCookie('timestamperSettings', timestamperSettingsString, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      sameSite: 'strict',
      secure: true,
    });
  }, [timestamperSettings]);

  const updateVideoId = () => {
    try {
      var url = new URL(videoIdRef.current.value);
      var params = new URLSearchParams(url.search);

      const videoId = params.get('v');

      if (videoId) {
        setVideoId(videoId);
        setVideoIdHasErrors(false);
      } else {
        setVideoIdHasErrors(true);
      }
    } catch (error) {
      setVideoIdHasErrors(true);
    }
  };

  const clearVideoId = () => {
    setVideoId(null);
    setVideoIdHasErrors(false);
    videoIdRef.current.value = '';
    player.loadVideoById({ videoId: null });
  };

  const clearTimestamps = () => {
    setTimestampList([]);
  };

  const secondsToTimestamp = (timestamp: number): TimestampTime => {
    if (timestamp <= 0) return { actualSeconds: 0, hours: '00', minutes: '00', seconds: '00' };

    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor((timestamp % 3600) / 60);
    const seconds = Math.floor(timestamp % 60);

    return {
      actualSeconds: timestamp,
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const generateTimestampExport = () => {
    if (timestampList === null) return;

    const timestampExport = timestampList
      .sort((ts1, ts2) => ts1.timestamp.actualSeconds - ts2.timestamp.actualSeconds)
      .map((timestamp) => {
        const {
          timestamp: { hours, minutes, seconds },
          event,
        } = timestamp;

        return `${hours != '00' ? `${hours}:` : ''}${minutes}:${seconds} ${event}`;
      })
      .join('\n');

    return timestampExport;
  };

  const loadCookies = () => {
    if (cookies.timestamps) {
      setTimestampList(cookies.timestamps);
    } else {
      setTimestampList([]);
    }

    if (cookies.videoId) {
      videoIdRef.current.value = `https://www.youtube.com/watch?v=${cookies.videoId}`;
      setVideoId(cookies.videoId);
    }

    if (cookies.timestamperSettings) {
      setTimestamperSettings(cookies.timestamperSettings);
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
          if (videoIdHasErrors) {
            return <Box color='red.600'>You provided an invalid link!</Box>;
          }
        })()}
        <Box display='grid' gridTemplateColumns={['1fr', '1fr', '1fr', '1fr 1fr']} gridGap='1rem' marginY='1rem'>
          <Box position='relative'>
            <Box className={styles.player} id='player'></Box>
            {(() => {
              if (videoId == null) {
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
                if (timestampList === null || timestampList.length === 0) {
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
                  return timestampList.map((timestamp, index) => {
                    return (
                      <Timestamp
                        key={index}
                        timestampEvent={timestamp}
                        timestampList={timestampList}
                        setTimestampList={setTimestampList}
                        addNewTimestamp={addNewTimestamp}
                        player={player}
                        isFocused={index === timestampList.length - 1}
                      />
                    );
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
              <div
                style={{ marginBlock: '0.5rem' }}
                dangerouslySetInnerHTML={{
                  __html:
                    '<style>img.kofiimg{display: initial!important;vertical-align:middle;height:13px!important;width:20px!important;padding-top:0!important;padding-bottom:0!important;border:none;margin-top:0;margin-right:5px!important;margin-left:0!important;margin-bottom:3px!important;content:url(\'https://storage.ko-fi.com/cdn/cup-border.png\')}.kofiimg:after{vertical-align:middle;height:25px;padding-top:0;padding-bottom:0;border:none;margin-top:0;margin-right:6px;margin-left:0;margin-bottom:4px!important;content:url(\'https://storage.ko-fi.com/cdn/whitelogo.svg\')}.btn-container{display:inline-block!important;white-space:nowrap;min-width:160px}span.kofitext{color:#fff !important;letter-spacing: -0.15px!important;text-wrap:none;vertical-align:middle;line-height:33px !important;padding:0;text-align:center;text-decoration:none!important; text-shadow: 0 1px 1px rgba(34, 34, 34, 0.05);}.kofitext a{color:#fff !important;text-decoration:none:important;}.kofitext a:hover{color:#fff !important;text-decoration:none}a.kofi-button{box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.2);line-height:36px!important;min-width:150px;display:inline-block!important;background-color:#29abe0;padding:2px 12px !important;text-align:center !important;border-radius:7px;color:#fff;cursor:pointer;overflow-wrap:break-word;vertical-align:middle;border:0 none #fff !important;font-family:\'Quicksand\',Helvetica,Century Gothic,sans-serif !important;text-decoration:none;text-shadow:none;font-weight:700!important;font-size:14px !important}a.kofi-button:visited{color:#fff !important;text-decoration:none !important}a.kofi-button:hover{opacity:.85;color:#f5f5f5 !important;text-decoration:none !important}a.kofi-button:active{color:#f5f5f5 !important;text-decoration:none !important}.kofitext img.kofiimg {height:15px!important;width:22px!important;display: initial;animation: kofi-wiggle 3s infinite;}@keyframes kofi-wiggle{0%{transform:rotate(0) scale(1)}60%{transform:rotate(0) scale(1)}75%{transform:rotate(0) scale(1.12)}80%{transform:rotate(0) scale(1.1)}84%{transform:rotate(-10deg) scale(1.1)}88%{transform:rotate(10deg) scale(1.1)}92%{transform:rotate(-10deg) scale(1.1)}96%{transform:rotate(10deg) scale(1.1)}100%{transform:rotate(0) scale(1)}}</style><link href="https://fonts.googleapis.com/css?family=Quicksand:400,700" rel="stylesheet" type="text/css"><div class="btn-container"><a title="Support me on ko-fi.com" class="kofi-button" style="background-color:#0e78b5;" href="https://ko-fi.com/W7W362D8G" target="_blank"> <span class="kofitext"><img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi donations" class="kofiimg">Give me your money</span></a></div>',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
      <ExportModal isOpen={isExportOpen} onClose={onExportClose} generateTimestampExport={generateTimestampExport} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        timestamperSettings={timestamperSettings}
        setTimestamperSettings={setTimestamperSettings}
      />
    </>
  );
};

export default Home;
