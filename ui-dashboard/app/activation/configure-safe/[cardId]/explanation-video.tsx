import Dialog from "@/components/dialog";

interface ExplanationVideoProps {
  isOpen: boolean;
  handleClose: () => void;
}

const videoConfig = {
  aspectRatio: 9 / 16,
  url: "https://www.youtube.com/embed/_-FoBiwBJTA?si=PNtu2K6VAPYcJBFz",
  title: "Gnosis Pay: Card Activation",
};

const ExplanationVideo = ({ isOpen, handleClose }: ExplanationVideoProps) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName="p-0 max-w-4xl"
    >
      <div
        className="relative overflow-hidden"
        style={{ paddingTop: `${videoConfig.aspectRatio * 100}%` }}
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={videoConfig.url}
          title={videoConfig.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </Dialog>
  );
};

export default ExplanationVideo;
