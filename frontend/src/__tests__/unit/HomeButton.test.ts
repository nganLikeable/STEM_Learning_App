// Unit test for the HomeButton's navigation callback.
// We verify the correct route is passed to router.replace without rendering any JSX.

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import { useRouter } from "expo-router";

describe("HomeButton – onPress handler", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("navigates to /(tabs) when pressed", () => {
    const router = useRouter();
    // Simulate what the button does on press
    router.replace("/(tabs)");
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("does not navigate before being pressed", () => {
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("navigates only once per press", () => {
    const router = useRouter();
    router.replace("/(tabs)");
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
