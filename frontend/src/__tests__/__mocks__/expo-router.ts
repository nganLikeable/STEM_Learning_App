export const useRouter = jest.fn(() => ({
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
}));
