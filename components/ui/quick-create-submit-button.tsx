import { Button } from "@/components/ui/button";
import { FC } from "react";

interface QuickCreateSubmitButtonProps {
  isLoading: boolean;
}

/**
 * Submit button for Quick Create Sales Job dialog.
 * Shows a loading spinner and disables itself when loading.
 */
const QuickCreateSubmitButton: FC<QuickCreateSubmitButtonProps> = ({
  isLoading,
}) => (
  <Button
    type="submit"
    disabled={isLoading}
    className="h-11 px-8"
    aria-busy={isLoading}
    aria-label={isLoading ? "Creating..." : "Create Job"}
  >
    {isLoading && (
      <svg
        className="animate-spin mr-2 h-4 w-4 text-white inline"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    )}
    {isLoading ? "Creating..." : "Create Job"}
  </Button>
);

export default QuickCreateSubmitButton;
