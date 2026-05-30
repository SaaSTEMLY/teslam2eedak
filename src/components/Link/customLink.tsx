import Link from "next/link";
import React from "react";

type CustomLinkType = {} & Parameters<typeof Link>[0];

const CustomLink: React.FC<CustomLinkType> = ({ ...props }) => {
  return <Link {...props} />;
};

export default CustomLink;
