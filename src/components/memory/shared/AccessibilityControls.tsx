import React from 'react';
import {
  Box,
  HStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import { FaTextHeight, FaAdjust, FaMicrophone } from 'react-icons/fa';

interface AccessibilityControlsProps {
  onFontSizeChange: (size: number) => void;
  onContrastChange: (high: boolean) => void;
  onVoiceGuidanceToggle: (enabled: boolean) => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  onFontSizeChange,
  onContrastChange,
  onVoiceGuidanceToggle,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [voiceEnabled, setVoiceEnabled] = React.useState(false);

  return (
    <Box
      p={4}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderRadius="lg"
      shadow="base"
      data-testid="accessibility-controls"
    >
      <HStack spacing={6}>
        <Box flex="1">
          <Tooltip
            hasArrow
            label="Adjust font size"
            isOpen={showTooltip}
            placement="top"
          >
            <Box>
              <Icon as={FaTextHeight} mr={2} />
              <Slider
                aria-label="font-size-slider"
                defaultValue={100}
                min={75}
                max={150}
                step={5}
                onChange={onFontSizeChange}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Tooltip>
        </Box>

        <IconButton
          aria-label="Toggle high contrast"
          icon={<FaAdjust />}
          onClick={() => onContrastChange(colorMode === 'light')}
        />

        <IconButton
          aria-label="Toggle voice guidance"
          icon={<FaMicrophone />}
          colorScheme={voiceEnabled ? 'blue' : 'gray'}
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            onVoiceGuidanceToggle(!voiceEnabled);
          }}
        />
      </HStack>
    </Box>
  );
};
