/**
 * LoadingButton — Button wrapper with loading state.
 */
import React from "react";
import { Button, type ButtonProps } from "./button";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({ loading = false, ...props }: LoadingButtonProps) {
  return <Button loading={loading} {...props} />;
}
