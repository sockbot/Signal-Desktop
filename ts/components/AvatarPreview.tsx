// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { noop } from 'lodash';

import * as log from '../logging/log';
import { LocalizerType } from '../types/Util';
import { Spinner } from './Spinner';
import { AvatarColors, AvatarColorType } from '../types/Colors';
import { getInitials } from '../util/getInitials';
import { imagePathToArrayBuffer } from '../util/imagePathToArrayBuffer';

export type PropsType = {
  avatarColor?: AvatarColorType;
  avatarPath?: string;
  avatarValue?: ArrayBuffer;
  conversationTitle?: string;
  i18n: LocalizerType;
  isEditable?: boolean;
  isGroup?: boolean;
  onAvatarLoaded?: (avatarBuffer: ArrayBuffer) => unknown;
  onClear?: () => unknown;
  onClick?: () => unknown;
  style?: CSSProperties;
};

enum ImageStatus {
  Nothing = 'nothing',
  Loading = 'loading',
  HasImage = 'has-image',
}

export const AvatarPreview = ({
  avatarColor = AvatarColors[0],
  avatarPath,
  avatarValue,
  conversationTitle,
  i18n,
  isEditable,
  isGroup,
  onAvatarLoaded,
  onClear,
  onClick,
  style = {},
}: PropsType): JSX.Element => {
  const startingAvatarPathRef = useRef<undefined | string>(
    avatarValue ? undefined : avatarPath
  );

  const [avatarPreview, setAvatarPreview] = useState<ArrayBuffer | undefined>();

  // Loads the initial avatarPath if one is provided.
  useEffect(() => {
    const startingAvatarPath = startingAvatarPathRef.current;
    if (!startingAvatarPath) {
      return noop;
    }

    let shouldCancel = false;

    (async () => {
      try {
        const buffer = await imagePathToArrayBuffer(startingAvatarPath);
        if (shouldCancel) {
          return;
        }
        setAvatarPreview(buffer);
        if (onAvatarLoaded) {
          onAvatarLoaded(buffer);
        }
      } catch (err) {
        if (shouldCancel) {
          return;
        }
        log.warn(
          `Failed to convert image URL to array buffer. Error message: ${
            err && err.message
          }`
        );
      }
    })();

    return () => {
      shouldCancel = true;
    };
  }, [onAvatarLoaded]);

  // Ensures that when avatarValue changes we generate new URLs
  useEffect(() => {
    if (avatarValue) {
      setAvatarPreview(avatarValue);
    } else {
      setAvatarPreview(undefined);
    }
  }, [avatarValue]);

  // Creates the object URL to render the ArrayBuffer image
  const [objectUrl, setObjectUrl] = useState<undefined | string>();

  useEffect(() => {
    if (!avatarPreview) {
      setObjectUrl(undefined);
      return noop;
    }

    const url = URL.createObjectURL(new Blob([avatarPreview]));
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarPreview]);

  let imageStatus: ImageStatus;
  if (avatarValue && !objectUrl) {
    imageStatus = ImageStatus.Loading;
  } else if (objectUrl) {
    imageStatus = ImageStatus.HasImage;
  } else {
    imageStatus = ImageStatus.Nothing;
  }

  const isLoading = imageStatus === ImageStatus.Loading;

  const clickProps = onClick ? { role: 'button', onClick } : {};
  const componentStyle = {
    ...style,
  };
  if (onClick) {
    componentStyle.cursor = 'pointer';
  }

  if (!avatarPreview) {
    return (
      <div className="AvatarPreview">
        <div
          className={`AvatarPreview__avatar BetterAvatarBubble--${avatarColor}`}
          {...clickProps}
          style={componentStyle}
        >
          {isGroup ? (
            <div
              className={`BetterAvatarBubble--${avatarColor}--icon AvatarPreview__group`}
            />
          ) : (
            getInitials(conversationTitle)
          )}
          {isEditable && <div className="AvatarPreview__upload" />}
        </div>
      </div>
    );
  }

  return (
    <div className="AvatarPreview">
      <div
        className={`AvatarPreview__avatar AvatarPreview__avatar--${imageStatus}`}
        {...clickProps}
        style={
          imageStatus === ImageStatus.HasImage
            ? {
                ...componentStyle,
                backgroundImage: `url(${objectUrl})`,
              }
            : componentStyle
        }
      >
        {isLoading && (
          <Spinner size="70px" svgSize="normal" direction="on-avatar" />
        )}
        {imageStatus === ImageStatus.HasImage && onClear && (
          <button
            aria-label={i18n('delete')}
            className="AvatarPreview__clear"
            onClick={onClear}
            tabIndex={-1}
            type="button"
          />
        )}
        {isEditable && <div className="AvatarPreview__upload" />}
      </div>
    </div>
  );
};
