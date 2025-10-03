import { create } from "zustand";

const initialState = { loading: false };

interface LoadingProps {
  loading: boolean;
  onLoading(loading: boolean): boolean;
  onAutomaticLoading(): void;
}

export const useLoading = create<LoadingProps>((set) => ({
  ...initialState,
  onLoading: (loading) => {
    set({ loading });
    return loading;
  },
  onAutomaticLoading: () => set(({ loading }) => ({ loading: !loading })),
}));
