import lavaBattleBg from "@assets/Lava_Stage_Battle_Screen_upscayl_2x_upscayl-standard-4x_1772324871274.png";

export default function LavaBattleBg() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <img
        src={lavaBattleBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: "auto" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,80,20,0.06) 0%, rgba(0,0,0,0.15) 100%)",
        }}
      />
    </div>
  );
}
