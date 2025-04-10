import React from 'react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import { MemorySidebar } from './MemorySidebar';
import { AccessibilityControls } from '../shared/AccessibilityControls';

interface MemoryLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  accessibilityMode?: boolean;
}

export const MemoryLayout: React.FC<MemoryLayoutProps> = ({
  children,
  showSidebar = true,
  accessibilityMode = false,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const contentBg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      display="flex"
      minH="100vh"
      bg={bgColor}
      data-testid="memory-layout"
    >
      {showSidebar && <MemorySidebar />}

      <Box flex="1" p={4}>
        {accessibilityMode && (
          <Box mb={4}>
            <AccessibilityControls
              onFontSizeChange={(size) => {
                // Update font size
              }}
              onContrastChange={(high) => {
                // Toggle high contrast
              }}
              onVoiceGuidanceToggle={(enabled) => {
                // Toggle voice guidance
              }}
            />
          </Box>
        )}

        <Container maxW="container.xl">
          <Box
            bg={contentBg}
            borderRadius="lg"
            p={6}
            shadow="base"
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
