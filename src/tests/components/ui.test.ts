/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import React from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

import { describe, it } from 'vitest';

describe('FIFA Synapse UI Primitives Component Tests', () => {
  // 1. Button component test
  it('should construct Button elements with correct class names and ARIA attributes', () => {
    // We instantiate the React element
    const btnDefault = React.createElement(Button, { variant: 'primary', size: 'md' }, 'Click me');
    
    assert.strictEqual(btnDefault.type, Button);
    assert.strictEqual(btnDefault.props.variant, 'primary');
    assert.strictEqual(btnDefault.props.size, 'md');
    assert.strictEqual(btnDefault.props.children, 'Click me');

    const btnLoading = React.createElement(Button, { isLoading: true }, 'Saving');
    assert.strictEqual(btnLoading.props.isLoading, true);
  });

  // 2. Badge component test
  it('should configure Badge colors and labels', () => {
    const badgeSuccess = React.createElement(Badge, { variant: 'success' }, 'Optimal');
    assert.strictEqual(badgeSuccess.props.variant, 'success');
    assert.strictEqual(badgeSuccess.props.children, 'Optimal');

    const badgeCritical = React.createElement(Badge, { variant: 'error' }, 'Crowded');
    assert.strictEqual(badgeCritical.props.variant, 'error');
  });

  // 3. Card component test
  it('should compose layout blocks into a responsive Card container', () => {
    const cardElement = React.createElement(Card, { 
      className: 'p-6 hover:shadow-lg',
      id: 'stadium-status-card'
    }, 'Inside Content');

    assert.strictEqual(cardElement.props.id, 'stadium-status-card');
    assert.strictEqual(cardElement.props.children, 'Inside Content');
    assert.ok(cardElement.props.className.includes('p-6'));
  });

  // 4. Input component test
  it('should accept typical text input parameters and accessible labels', () => {
    const inputElement = React.createElement(Input, {
      type: 'text',
      placeholder: 'Search Sector ID...',
      'aria-label': 'Stadium Sector Input',
      disabled: false
    });

    assert.strictEqual(inputElement.props.type, 'text');
    assert.strictEqual(inputElement.props.placeholder, 'Search Sector ID...');
    assert.strictEqual(inputElement.props['aria-label'], 'Stadium Sector Input');
    assert.strictEqual(inputElement.props.disabled, false);
  });
});
