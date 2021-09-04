import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  ModalFooter,
  Button,
  Text,
  Tooltip,
  Box,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import { useCookies } from 'react-cookie';
import { TimestamperActionKind, TimestamperContext, TimestamperSettings } from '../../pages';

const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['timestamps', 'videoId', 'timestamperSettings']);
  const { state, dispatch } = useContext(TimestamperContext);

  const onInputChanged = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    const newSettings = { ...state.timestamperSettings, [name]: value };
    setCookie('timestamperSettings', newSettings);
    dispatch({
      type: TimestamperActionKind.SET_TIMESTAMPER_SETTINGS,
      payload: newSettings,
    });
  };

  const clearCookies = () => {
    removeCookie('timestamperSettings');
    removeCookie('timestamps');
    removeCookie('videoId');
    window.location.reload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display='flex' sx={{ gap: '0.5rem' }} flexDir='column'>
            <label>
              <Text>
                <Tooltip hasArrow label='Number of seconds before the current time when creating timestamp.'>
                  Time offset (seconds):
                </Tooltip>
              </Text>
              <Input
                type='number'
                onChange={onInputChanged}
                name='timeOffset'
                value={state.timestamperSettings.timeOffset}
              />
            </label>
            <Tooltip hasArrow label='Clear all site data such as current video ID, saved timestamps and settings.'>
              <Button onClick={clearCookies} colorScheme='red'>
                Clear All Data
              </Button>
            </Tooltip>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
