import { formatDateTime } from "../../utils/format";
import { Hold } from "../../types";

interface HoldBannerProps {
  hold: Hold;
  seconds: number;
}

export default function HoldBanner({ hold, seconds }: HoldBannerProps) {
  return (
    <div className="hold-banner">
      <div>
        <strong>Slot held:</strong> {formatDateTime(hold.startAt)} –{" "}
        {new Date(hold.endAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </div>
      <div className="hold-timer">{seconds}s remaining</div>
    </div>
  );
}
