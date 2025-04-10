import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { handleError } from '../utils/error-handler';

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

/**
 * Custom hook to copy text to clipboard with success/error toasts
 * 
 * @returns [copiedText, copy] A tuple with the copied text and copy function
 */
export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      toast.error('Clipboard API not available');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Copied to clipboard');
      return true;
    } catch (error) {
      handleError(
        error,
        'useCopyToClipboard',
        'Failed to copy text to clipboard',
        { silent: false }
      );
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
} 