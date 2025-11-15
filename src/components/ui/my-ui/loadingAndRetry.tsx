import { FaExclamationTriangle } from "react-icons/fa";
import { Button } from "../button";
import { Spinner } from "../spinner";

export default function LoadingAndRetry({
  isLoading,
  isError,
  retry,
}: {
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      {isLoading && <Spinner className="mx-auto h-24 w-24" />}

      {isError && (
        <>
          <h2 className="flex items-center justify-center gap-2 uppercase">
            <FaExclamationTriangle /> error <FaExclamationTriangle />
          </h2>
          <div className="my-8 flex flex-col items-center justify-center gap-2">
            <p>An occurred has occurred, would you like to try?</p>
            <Button
              variant={"default"}
              size={"lg"}
              onClick={retry}
              className="text-xl"
            >
              Retry
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
