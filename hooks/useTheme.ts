import { useColorScheme } from 'react-native';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    background: isDark ? '#181A20' : '#ffff',
    text: isDark ? '#fff' : '#000',
    placeholder: isDark ? '#A1A4B2' : '#3C3F4A',
    inputBg: isDark ? '#23262F' : '#fff',
    border: isDark ? '#31A71B' : '#31A71B',
    buttonBg: '#31A71B',
    buttonText: isDark ? '#fff' : '#000',
    info: '#1890ff30',
    error: '#e4e4e422',
    success: '#52c41a30',
  };
}