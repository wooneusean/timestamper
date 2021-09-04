import { CopyIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Textarea,
  ModalFooter,
  Button,
  useToast,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import { TimestamperContext } from '../../pages';

const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { state, dispatch } = useContext(TimestamperContext);

  const copyTimestampExport = () => {
    navigator.clipboard.writeText(generateTimestampExport());

    toast({
      title: 'Copied to clipboard!',
      description: 'You can paste it directly into the YouTube chat.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const generateTimestampExport = () => {
    if (state.timestampList === null) return;

    const newTimestampList = [...state.timestampList];

    const timestampExport = newTimestampList
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export As Text</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Textarea whiteSpace='pre-wrap' height='400px'>
            {generateTimestampExport()}
          </Textarea>
        </ModalBody>

        <ModalFooter>
          <Button variant='ghost' mr={3} leftIcon={<CopyIcon />} onClick={copyTimestampExport}>
            Copy
          </Button>
          <Button colorScheme='red' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
