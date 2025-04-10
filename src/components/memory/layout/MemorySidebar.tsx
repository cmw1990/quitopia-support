import React from 'react';
import { Box, VStack, Text, Icon, Link, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FaBrain, FaBook, FaClipboardCheck, FaUserNurse, FaImages } from 'react-icons/fa';
import { BiHomeAlt } from 'react-icons/bi';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, isActive }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const color = useColorModeValue('gray.700', 'gray.200');
  const activeColor = useColorModeValue('blue.600', 'blue.200');

  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Box
        display="flex"
        alignItems="center"
        p={3}
        borderRadius="md"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : color}
        _hover={{ bg: isActive ? activeBg : hoverBg }}
        cursor="pointer"
        role="group"
      >
        <Icon as={icon} boxSize={5} mr={4} />
        <Text fontSize="md" fontWeight={isActive ? 'semibold' : 'medium'}>
          {children}
        </Text>
      </Box>
    </Link>
  );
};

export const MemorySidebar: React.FC = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { path: '/memory', label: 'Memory Hub', icon: BiHomeAlt },
    { path: '/memory/training', label: 'Training', icon: FaBrain },
    { path: '/memory/journal', label: 'Journal', icon: FaBook },
    { path: '/memory/assessment', label: 'Assessment', icon: FaClipboardCheck },
    { path: '/memory/care', label: 'Memory Care', icon: FaUserNurse },
    { path: '/memory/albums', label: 'Albums', icon: FaImages },
  ];

  return (
    <Box
      w="280px"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      h="100vh"
      position="sticky"
      top={0}
      data-testid="memory-sidebar"
    >
      <VStack spacing={2} align="stretch" p={4}>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            icon={item.icon}
            isActive={location.pathname === item.path}
          >
            {item.label}
          </NavItem>
        ))}
      </VStack>
    </Box>
  );
};
