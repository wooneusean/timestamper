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
import React from 'react';

const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void; generateTimestampExport: () => string }> = ({
  isOpen,
  onClose,
  generateTimestampExport,
}) => {
  const toast = useToast();

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
