import { Base, TextBaseComponentProps } from "../Base";

export const Title: React.FC<TextBaseComponentProps> = ({
  children,
  className,
}) => {
  return (
    <Base as="h1" className={className}>
      {children}
    </Base>
  );
};
