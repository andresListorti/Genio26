import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  onAuthStateChangedMock,
  signInMock,
  signUpMock,
  signInWithPopupMock,
  signOutMock,
  updateProfileMock,
  docMock,
  getDocMock,
  setDocMock,
  updateDocMock,
} = vi.hoisted(() => ({
  onAuthStateChangedMock: vi.fn(),
  signInMock: vi.fn().mockResolvedValue(undefined),
  signUpMock: vi.fn(),
  signInWithPopupMock: vi.fn().mockResolvedValue(undefined),
  signOutMock: vi.fn().mockResolvedValue(undefined),
  updateProfileMock: vi.fn().mockResolvedValue(undefined),
  docMock: vi.fn((..._args: unknown[]) => ({ __ref: true })),
  getDocMock: vi.fn(),
  setDocMock: vi.fn().mockResolvedValue(undefined),
  updateDocMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: onAuthStateChangedMock,
  signInWithEmailAndPassword: signInMock,
  createUserWithEmailAndPassword: signUpMock,
  signInWithPopup: signInWithPopupMock,
  signOut: signOutMock,
  updateProfile: updateProfileMock,
}));

vi.mock("firebase/firestore", () => ({
  doc: docMock,
  getDoc: getDocMock,
  setDoc: setDocMock,
  updateDoc: updateDocMock,
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

import { AuthProvider, useAuth } from "./AuthContext";

const fakeUser = {
  uid: "user-1",
  email: "buyer@test.com",
  displayName: "Buyer",
  photoURL: null,
} as unknown as import("firebase/auth").User;

beforeEach(() => {
  vi.clearAllMocks();
  onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
    cb(null);
    return () => {};
  });
});

describe("AuthProvider / useAuth", () => {
  it("starts logged out once the initial auth check resolves", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("loads an existing profile document for a signed-in user", async () => {
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(fakeUser);
      return () => {};
    });
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: "user-1", email: "buyer@test.com", displayName: "Buyer", photoURL: null, role: "user" }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.profile?.role).toBe("user");
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("creates a default profile document on first sign-in", async () => {
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(fakeUser);
      return () => {};
    });
    getDocMock.mockResolvedValue({ exists: () => false, data: () => undefined });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(setDocMock).toHaveBeenCalled();
    expect(result.current.profile?.role).toBe("user");
  });

  it("falls back to a null profile when Firestore lookup throws", async () => {
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(fakeUser);
      return () => {};
    });
    getDocMock.mockRejectedValue(new Error("permission-denied"));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profile).toBeNull();
  });

  it("signIn delegates to Firebase with the given credentials", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn("buyer@test.com", "secret123");
    });

    expect(signInMock).toHaveBeenCalledWith({}, "buyer@test.com", "secret123");
  });

  it("logout calls Firebase signOut", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(signOutMock).toHaveBeenCalled();
  });

  it("updateUserProfile is a no-op when there is no signed-in user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateUserProfile({ displayName: "New Name" });
    });

    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it("updateUserProfile updates Firestore and local state for a signed-in user", async () => {
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(fakeUser);
      return () => {};
    });
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: "user-1", email: "buyer@test.com", displayName: "Buyer", photoURL: null, role: "user" }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.profile).not.toBeNull());

    await act(async () => {
      await result.current.updateUserProfile({ displayName: "New Name" });
    });

    expect(updateDocMock).toHaveBeenCalled();
    expect(updateProfileMock).toHaveBeenCalledWith(fakeUser, { displayName: "New Name" });
    expect(result.current.profile?.displayName).toBe("New Name");
  });
});
