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
import React from 'react';
import { useCookies } from 'react-cookie';
import { TimestamperSettings } from '../../pages';

const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  timestamperSettings: TimestamperSettings;
  setTimestamperSettings: React.Dispatch<React.SetStateAction<TimestamperSettings>>;
}> = ({ isOpen, onClose, timestamperSettings, setTimestamperSettings }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['timestamps', 'videoId', 'timestamperSettings']);

  const onInputChanged = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setTimestamperSettings({ ...timestamperSettings, [name]: value });
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
              <Input type='number' onChange={onInputChanged} name='timeOffset' value={timestamperSettings.timeOffset} />
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
