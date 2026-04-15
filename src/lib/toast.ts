import { sileo } from "sileo";

type ToastOptions = {
  id?: string;
};

type ToastMessage = string;

export const toast = {
  loading(message: ToastMessage) {
    return sileo.show({
      title: message,
      type: "loading",
    });
  },
  success(message: ToastMessage, options?: ToastOptions) {
    if (options?.id) {
      sileo.dismiss(options.id);
    }
    return sileo.success({
      title: message,
    });
  },
  error(message: ToastMessage, options?: ToastOptions) {
    if (options?.id) {
      sileo.dismiss(options.id);
    }
    return sileo.error({
      title: message,
    });
  },
  info(message: ToastMessage, options?: ToastOptions) {
    if (options?.id) {
      sileo.dismiss(options.id);
    }
    return sileo.info({
      title: message,
    });
  },
};
