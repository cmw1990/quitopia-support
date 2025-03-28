import { J as Jt } from './proxy-0fb2bf4b.js';

function useToast() {
  return {
    toast: {
      ...Jt,
      success: (title, description) => Jt.success(title, { description }),
      error: (title, description) => Jt.error(title, { description }),
      warning: (title, description) => Jt.warning(title, { description }),
      info: (title, description) => Jt.info(title, { description })
    }
  };
}

export { useToast as u };
