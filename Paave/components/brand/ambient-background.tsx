/**
 * Two soft glow orbs (lime + plasma) that anchor the kinetic V2.0 canvas.
 * Positioned to hint at motion off-screen without crowding content.
 */
export function AmbientBackground() {
  return (
    <>
      <div className="glow-orb glow-orb--lime left-[-80px] top-[30%] animate-pulse-glow" />
      <div className="glow-orb glow-orb--plasma right-[-80px] top-[60%] animate-pulse-glow" />
    </>
  );
}
