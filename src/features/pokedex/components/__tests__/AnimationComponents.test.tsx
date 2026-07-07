import React from 'react';
import { render } from '../../../../test-utils';
import { CapturedAura } from '../CapturedAura';
import { CaptureEffect } from '../CaptureEffect';
import { EscapeEffect } from '../EscapeEffect';
import { ReleaseEffect } from '../ReleaseEffect';

const noop = jest.fn();

describe('CapturedAura', () => {
  it('renderiza sin errores cuando visible es false', async () => {
    await render(<CapturedAura visible={false} isInTeam={false} />);
  });

  it('renderiza sin errores cuando visible es true (in team)', async () => {
    await render(<CapturedAura visible={true} isInTeam={true} />);
  });

  it('renderiza sin errores cuando visible es true (in box)', async () => {
    await render(<CapturedAura visible={true} isInTeam={false} />);
  });
});

describe('CaptureEffect', () => {
  it('renderiza sin errores cuando visible es false', async () => {
    await render(<CaptureEffect visible={false} onComplete={noop} />);
  });

  it('renderiza sin errores cuando visible es true', async () => {
    await render(<CaptureEffect visible={true} onComplete={noop} />);
  });
});

describe('EscapeEffect', () => {
  it('renderiza sin errores cuando visible es false', async () => {
    await render(<EscapeEffect visible={false} onComplete={noop} />);
  });

  it('renderiza sin errores cuando visible es true', async () => {
    await render(<EscapeEffect visible={true} onComplete={noop} />);
  });
});

describe('ReleaseEffect', () => {
  it('renderiza sin errores cuando visible es false', async () => {
    await render(<ReleaseEffect visible={false} onComplete={noop} />);
  });

  it('renderiza sin errores cuando visible es true', async () => {
    await render(<ReleaseEffect visible={true} onComplete={noop} />);
  });
});
