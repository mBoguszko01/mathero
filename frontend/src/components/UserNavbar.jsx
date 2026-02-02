import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import "../styles/UserMobileNavbar.css";
import "../styles/UserDesktopNavbar.css";
import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DesktopNavbar";
export default function UserNavbar() {

  const user = useSelector((state) => state.user.data);
  const isMobile = useMediaQuery({ maxWidth: 1024 });
  const streak = user.streak_days ?? 0;
  const money = user.money ?? 0
  return isMobile ? (
    <MobileNavbar streak={streak} money={money} />
  ) : (
    <DesktopNavbar streak={streak} money={money} />
  );
}
