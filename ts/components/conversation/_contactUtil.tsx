// Copyright 2019-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';
import classNames from 'classnames';

import { Avatar, AvatarBlur } from '../Avatar';
import { Spinner } from '../Spinner';

import { LocalizerType } from '../../types/Util';
import { AvatarColors } from '../../types/Colors';
import { ContactType, getName } from '../../types/Contact';

// This file starts with _ to keep it from showing up in the StyleGuide.

export function renderAvatar({
  contact,
  i18n,
  size,
  direction,
}: {
  contact: ContactType;
  i18n: LocalizerType;
  size: 28 | 52 | 80;
  direction?: 'outgoing' | 'incoming';
}): JSX.Element {
  const { avatar } = contact;

  const avatarPath = avatar && avatar.avatar && avatar.avatar.path;
  const pending = avatar && avatar.avatar && avatar.avatar.pending;
  const title = getName(contact) || '';
  const spinnerSvgSize = size < 50 ? 'small' : 'normal';
  const spinnerSize = size < 50 ? '24px' : undefined;

  if (pending) {
    return (
      <div className="module-embedded-contact__spinner-container">
        <Spinner
          svgSize={spinnerSvgSize}
          size={spinnerSize}
          direction={direction}
        />
      </div>
    );
  }

  return (
    <Avatar
      acceptedMessageRequest={false}
      avatarPath={avatarPath}
      blur={AvatarBlur.NoBlur}
      color={AvatarColors[0]}
      conversationType="direct"
      i18n={i18n}
      isMe
      title={title}
      sharedGroupNames={[]}
      size={size}
    />
  );
}

export function renderName({
  contact,
  isIncoming,
  module,
}: {
  contact: ContactType;
  isIncoming: boolean;
  module: string;
}): JSX.Element {
  return (
    <div
      className={classNames(
        `module-${module}__contact-name`,
        isIncoming ? `module-${module}__contact-name--incoming` : null
      )}
    >
      {getName(contact)}
    </div>
  );
}

export function renderContactShorthand({
  contact,
  isIncoming,
  module,
}: {
  contact: ContactType;
  isIncoming: boolean;
  module: string;
}): JSX.Element {
  const { number: phoneNumber, email } = contact;
  const firstNumber = phoneNumber && phoneNumber[0] && phoneNumber[0].value;
  const firstEmail = email && email[0] && email[0].value;

  return (
    <div
      className={classNames(
        `module-${module}__contact-method`,
        isIncoming ? `module-${module}__contact-method--incoming` : null
      )}
    >
      {firstNumber || firstEmail}
    </div>
  );
}
