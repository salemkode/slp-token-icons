# Fixing Reanimated `.value` Usage During Component Render

## Understanding the Warning

The warning:
```
WARN [Reanimated] Reading from `value` during component render. Please ensure that you don't access the `value` property nor use `get` method of a shared value while React is rendering a component.
```

This occurs when you access a Reanimated shared value's `.value` property during the render phase of a React component, which can cause performance issues and unexpected behavior.

## Common Problematic Patterns

### 1. Direct `.value` Access in Render
```javascript
// ❌ BAD - Accessing .value during render
function MyComponent() {
  const animatedValue = useSharedValue(0);
  
  return (
    <View>
      <Text>{animatedValue.value}</Text> {/* This causes the warning */}
    </View>
  );
}
```

### 2. Using `.value` in useEffect Dependencies
```javascript
// ❌ BAD - Using .value in dependency array
function MyComponent() {
  const scale = useSharedValue(1);
  
  useEffect(() => {
    // Some side effect
  }, [scale.value]); // This causes the warning
  
  return <Animated.View />;
}
```

### 3. Conditional Rendering Based on `.value`
```javascript
// ❌ BAD - Conditional rendering with .value
function MyComponent() {
  const progress = useSharedValue(0);
  
  return (
    <View>
      {progress.value > 0.5 && <Text>Half way there!</Text>} {/* Warning */}
    </View>
  );
}
```

### 4. Using `.value` in Inline Styles
```javascript
// ❌ BAD - Using .value in inline styles during render
function MyComponent() {
  const opacity = useSharedValue(1);
  
  return (
    <View style={{ opacity: opacity.value }}> {/* Warning */}
      <Text>Content</Text>
    </View>
  );
}
```

## How to Fix These Patterns

### 1. Use `useDerivedValue` for Computed Values
```javascript
// ✅ GOOD - Use useDerivedValue for computed values
function MyComponent() {
  const animatedValue = useSharedValue(0);
  const displayValue = useDerivedValue(() => {
    return Math.round(animatedValue.value);
  });
  
  // Use useAnimatedStyle for styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
    };
  });
  
  return (
    <Animated.View style={animatedStyle}>
      {/* For text, use useAnimatedProps or convert to regular state */}
    </Animated.View>
  );
}
```

### 2. Use `useAnimatedStyle` for Animated Styles
```javascript
// ✅ GOOD - Use useAnimatedStyle
function MyComponent() {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  return <Animated.View style={animatedStyle} />;
}
```

### 3. Use State for React Render Logic
```javascript
// ✅ GOOD - Convert to state for render logic
function MyComponent() {
  const progress = useSharedValue(0);
  const [isHalfway, setIsHalfway] = useState(false);
  
  // Update state based on animated value changes
  useDerivedValue(() => {
    const newIsHalfway = progress.value > 0.5;
    if (newIsHalfway !== isHalfway) {
      runOnJS(setIsHalfway)(newIsHalfway);
    }
  });
  
  return (
    <View>
      {isHalfway && <Text>Half way there!</Text>}
    </View>
  );
}
```

### 4. Use `useAnimatedReaction` for Side Effects
```javascript
// ✅ GOOD - Use useAnimatedReaction for side effects
function MyComponent() {
  const scale = useSharedValue(1);
  const [displayScale, setDisplayScale] = useState(1);
  
  useAnimatedReaction(
    () => scale.value,
    (currentValue) => {
      // Run side effects based on value changes
      runOnJS(setDisplayScale)(Math.round(currentValue * 100) / 100);
    }
  );
  
  return (
    <View>
      <Text>Scale: {displayScale}</Text>
    </View>
  );
}
```

## Search Commands to Find Problematic Code

Use these commands in your actual React Native project to find instances:

```bash
# Search for .value usage in render
grep -r "\.value" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/

# Look for shared values in JSX
grep -r "useSharedValue.*\.value" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/

# Find conditional rendering with .value
grep -r "\.value.*&&\|\.value.*?" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/
```

## Best Practices

1. **Never access `.value` during render** - Use `useAnimatedStyle`, `useDerivedValue`, or convert to regular state
2. **Use `runOnJS`** when you need to update React state from animated values
3. **Use `useAnimatedReaction`** for side effects based on animated value changes
4. **Use `useDerivedValue`** for computed animated values
5. **Keep animation logic separate** from React render logic

## Tools to Help

- Enable strict mode in Reanimated for better warnings
- Use ESLint rules to catch these patterns
- Consider using TypeScript for better type safety

## Additional Resources

- [Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [Logger Configuration](https://docs.swmansion.com/react-native-reanimated/docs/debugging/logger-configuration)