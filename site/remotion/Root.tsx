import { Composition } from "remotion";
import { Ch1Turing } from "./ch1-turing";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Ch1Turing"
        component={Ch1Turing}
        durationInFrames={2100}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
