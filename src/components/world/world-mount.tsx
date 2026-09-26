import { Component, lazy, Suspense, useSyncExternalStore, type ReactNode } from "react";
import { publicPath } from "@/content/packet";

const loadLodge = () => import("@/components/world/lodge-canvas");

if (typeof window !== "undefined") {
  void loadLodge();
}

const LodgeCanvas = lazy(loadLodge);

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function useClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function WorldMount() {
  const client = useClient();

  return (
    <>
      <div
        className="hero-still"
        style={{ backgroundImage: `url("${publicPath("/plates/set-chair.jpg")}")` }}
        aria-hidden="true"
      />
      {client ? (
        <Boundary>
          <Suspense fallback={null}>
            <LodgeCanvas />
          </Suspense>
        </Boundary>
      ) : null}
    </>
  );
}
