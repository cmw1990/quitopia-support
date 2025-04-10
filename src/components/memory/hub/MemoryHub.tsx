import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import { MemoryLayout } from '../layout/MemoryLayout';

interface MemoryMetrics {
  assessmentScore: number;
  exercisesCompleted: number;
  journalEntries: number;
  memoryStrength: number;
}

export const MemoryHub: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Mock data - replace with actual data from your hooks
  const metrics: MemoryMetrics = {
    assessmentScore: 85,
    exercisesCompleted: 24,
    journalEntries: 12,
    memoryStrength: 78,
  };

  const StatCard: React.FC<{
    label: string;
    value: number;
    helpText: string;
  }> = ({ label, value, helpText }) => (
    <Box
      p={6}
      bg={cardBg}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Stat>
        <StatLabel fontSize="md">{label}</StatLabel>
        <StatNumber fontSize="3xl">{value}</StatNumber>
        <StatHelpText>{helpText}</StatHelpText>
      </Stat>
    </Box>
  );

  return (
    <MemoryLayout>
      <Box>
        <Heading mb={6}>Memory Hub</Heading>
        
        <Text mb={8} color="gray.600">
          Track your memory health and access all memory-related tools and features.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <StatCard
            label="Memory Assessment"
            value={metrics.assessmentScore}
            helpText="Latest assessment score"
          />
          <StatCard
            label="Exercises Completed"
            value={metrics.exercisesCompleted}
            helpText="Last 30 days"
          />
          <StatCard
            label="Journal Entries"
            value={metrics.journalEntries}
            helpText="Total entries this month"
          />
          <StatCard
            label="Memory Strength"
            value={metrics.memoryStrength}
            helpText="Overall performance"
          />
        </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <Box
            p={6}
            bg={cardBg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Heading size="md" mb={4}>Recent Activity</Heading>
            {/* Add activity timeline component here */}
          </Box>

          <Box
            p={6}
            bg={cardBg}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Heading size="md" mb={4}>Quick Actions</Heading>
            {/* Add quick action buttons here */}
          </Box>
        </Grid>
      </Box>
    </MemoryLayout>
  );
};
