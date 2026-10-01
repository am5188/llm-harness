import { Composition } from "remotion";
import { Ch1Turing, CH1_TOTAL_FRAMES } from "./ch1-turing";
import { Ch1StyleSample } from "./ch1-style-sample";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Ch1Turing"
        component={Ch1Turing}
        durationInFrames={CH1_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Ch1StyleSample"
        component={Ch1StyleSample}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
