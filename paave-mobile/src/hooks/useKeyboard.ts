/**
 * useKeyboard — track software keyboard visibility and height.
 *
 * Returns:
 *   keyboardHeight — current keyboard height in px (0 when hidden)
 *   isVisible      — boolean convenience flag
 */
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

interface UseKeyboardReturn {
  keyboardHeight: number;
  isVisible: boolean;
}

export function useKeyboard(): UseKeyboardReturn {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return {
    keyboardHeight,
    isVisible: keyboardHeight > 0,
  };
}
