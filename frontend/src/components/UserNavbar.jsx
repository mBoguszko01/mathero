import {useMediaQuery} from "react-responsive";
import "../styles/UserMobileNavbar.css";
import "../styles/UserDesktopNavbar.css";
import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DesktopNavbar";
export default function UserNavbar() {
  return useMediaQuery({ maxWidth: 1024 }) ? <MobileNavbar /> : <DesktopNavbar />;
}
