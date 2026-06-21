import { Coordinate, ISeriesApi, SeriesType, Time, UTCTimestamp, IChartApiBase, Logical, BarPrice, ITimeScaleApi } from 'lightweight-charts';
import { BaseLineTool } from '../model/base-line-tool';
/**
 * Represents a 2D point or vector in the chart's coordinate system.
 *
 * This class provides standard vector arithmetic operations required for geometric calculations,
 * hit testing, and rendering logic.
 */
export declare class Point {
    /** The x-coordinate (pixel value). */
    x: Coordinate;
    /** The y-coordinate (pixel value). */
    y: Coordinate;
    /**
     * Creates a new Point instance.
     * @param x - The x-coordinate.
     * @param y - The y-coordinate.
     */
    constructor(x: number, y: number);
    /**
     * Adds another point/vector to this one.
     * @param point - The point to add.
     * @returns A new Point representing the sum (`this + point`).
     */
    add(point: Point): Point;
    /**
     * Adds a scaled version of another point/vector to this one.
     * Useful for linear interpolations or projections.
     *
     * @param point - The direction vector to add.
     * @param scale - The scalar factor to multiply `point` by before adding.
     * @returns A new Point representing (`this + (point * scale)`).
     */
    addScaled(point: Point, scale: number): Point;
    /**
     * Subtracts another point/vector from this one.
     * @param point - The point to subtract.
     * @returns A new Point representing the difference (`this - point`).
     */
    subtract(point: Point): Point;
    /**
     * Calculates the dot product of this vector and another.
     * Formula: `x1*x2 + y1*y2`.
     *
     * @param point - The other vector.
     * @returns The scalar dot product.
     */
    dotProduct(point: Point): number;
    /**
     * Calculates the 2D cross product (determinant) magnitude of this vector and another.
     * Formula: `x1*y2 - y1*x2`.
     *
     * @param point - The other vector.
     * @returns The scalar cross product.
     */
    crossProduct(point: Point): number;
    /**
     * Calculates the signed angle between this vector and another.
     *
     * @param point - The other vector.
     * @returns The angle in radians (range -π to π).
     */
    signedAngle(point: Point): number;
    /**
     * Calculates the unsigned angle between this vector and another.
     *
     * @param point - The other vector.
     * @returns The angle in radians (range 0 to π).
     */
    angle(point: Point): number;
    /**
     * Calculates the Euclidean length (magnitude) of the vector.
     * @returns The length of the vector.
     */
    length(): number;
    /**
     * Multiplies the vector by a scalar value.
     * @param scale - The scaling factor.
     * @returns A new scaled Point.
     */
    scaled(scale: number): Point;
    /**
      * Returns a normalized version of the vector (unit vector with length 1).
      * @returns A new Point with the same direction but length 1. Returns (0,0) if original length is 0.
      */
    normalized(): Point;
    /**
     * Returns a perpendicular vector rotated 90 degrees counter-clockwise.
     * Maps `(x, y)` to `(-y, x)`.
     *
     * @returns A new transposed Point.
     */
    transposed(): Point;
    /**
     * Creates a deep copy of this Point.
     * @returns A new Point instance with identical coordinates.
     */
    clone(): Point;
}
/**
 * Represents an Axis-Aligned Bounding Box (AABB) defined by two corner points.
 *
 * The box is normalized upon construction so that `min` always contains the
 * smallest x and y values, and `max` contains the largest.
 */
export declare class Box {
    min: Point;
    max: Point;
    constructor(a: Point, b: Point);
}
/**
 * Represents a geometric half-plane, defined by a dividing line (edge) and a boolean
 * indicating which side of the line is considered "inside" or positive.
 *
 * Used primarily for polygon clipping algorithms (e.g., Sutherland-Hodgman).
 */
export declare class HalfPlane {
    edge: Line;
    isPositive: boolean;
    constructor(edge: Line, isPositive: boolean);
}
/**
 * Interface representing a line in the general equation form: `ax + by + c = 0`.
 *
 * This form is preferred over slope-intercept for geometric algorithms because it
 * handles vertical lines natively without division by zero.
 */
export interface Line {
    a: number;
    b: number;
    c: number;
}
/**
 * A type alias representing a finite line segment defined by exactly two points: `[Start, End]`.
 */
export type Segment = [Point, Point];
/**
 * Checks if two points are geometrically identical.
 *
 * @param a - The first point.
 * @param b - The second point.
 * @returns `true` if both x and y coordinates match exactly, otherwise `false`.
 */
export declare function equalPoints(a: Point, b: Point): boolean;
/**
 * Factory function to create a {@link Line} object from coefficients.
 *
 * Creates a line object satisfying the equation `ax + by + c = 0`.
 *
 * @param a - The 'a' coefficient (coefficient of x).
 * @param b - The 'b' coefficient (coefficient of y).
 * @param c - The 'c' constant term.
 * @returns A {@link Line} object.
 */
export declare function line(a: number, b: number, c: number): Line;
/**
 * Constructs a {@link Line} that passes through two distinct points.
 *
 * Derives the general equation coefficients `a`, `b`, and `c` based on the coordinates
 * of the provided points.
 *
 * @param a - The first point.
 * @param b - The second point.
 * @returns A {@link Line} object representing the infinite line through `a` and `b`.
 */
export declare function lineThroughPoints(a: Point, b: Point): Line;
/**
 * Factory function to create a {@link Segment} tuple.
 *
 * @param a - The start point.
 * @param b - The end point.
 * @returns A tuple `[a, b]`.
 * @throws Error if `a` and `b` are the same point (segments must be distinct).
 */
export declare function lineSegment(a: Point, b: Point): Segment;
/**
 * Constructs a {@link HalfPlane} defined by a boundary edge and a reference point.
 *
 * The resulting half-plane includes the side of the `edge` line where `point` resides.
 *
 * @param edge - The infinite line defining the boundary.
 * @param point - A point strictly inside the desired half-plane.
 * @returns A {@link HalfPlane} object.
 */
export declare function halfPlaneThroughPoint(edge: Line, point: Point): HalfPlane;
/**
 * Checks if a specific point lies within a defined {@link HalfPlane}.
 *
 * It evaluates the line equation `ax + by + c` at the point's coordinates and compares
 * the sign of the result against the half-plane's positive/negative orientation.
 *
 * @param point - The point to test.
 * @param halfPlane - The geometric half-plane definition.
 * @returns `true` if the point is strictly inside the half-plane, `false` otherwise.
 */
export declare function pointInHalfPlane(point: Point, halfPlane: HalfPlane): boolean;
/**
 * Checks if two bounding boxes are geometrically identical.
 *
 * Equality requires that both the `min` and `max` points of the boxes match exactly.
 *
 * @param a - The first bounding box.
 * @param b - The second bounding box.
 * @returns `true` if the boxes occupy exactly the same space.
 */
export declare function equalBoxes(a: Box, b: Box): boolean;
/**
 * Clips an arbitrary polygon against the rectangular viewport boundaries.
 *
 * This implementation uses the Sutherland-Hodgman algorithm to iteratively clip the polygon
 * against the four edges of the screen (0, 0, Width, Height).
 *
 * @param points - The array of vertices defining the polygon.
 * @param W - The width of the viewport in pixels.
 * @param H - The height of the viewport in pixels.
 * @returns An array of points representing the clipped polygon, or `null` if the polygon is fully outside.
 */
export declare function clipPolygonToViewport(points: Point[], W: number, H: number): Point[] | null;
/**
 * Calculates the intersection geometry between an infinite {@link Line} and an axis-aligned {@link Box}.
 *
 * @param line - The infinite line equation (`ax + by + c = 0`).
 * @param box - The bounding box.
 * @returns A {@link Segment} (if passing through), a single {@link Point} (if touching a corner/edge tangentially), or `null` (if no intersection).
 */
export declare function intersectLineAndBox(line: Line, box: Box): Segment | Point | null;
/**
 * Calculates the intersection point of a Ray (semi-infinite line) and a bounding box.
 *
 * A ray is defined by an origin (`point0`) and a through-point (`point1`). This function finds
 * the first point where the ray enters or touches the box.
 *
 * @param point0 - The origin of the ray.
 * @param point1 - A second point defining the ray's direction.
 * @param box - The bounding box to test against.
 * @returns The first intersection {@link Point}, or `null` if the ray misses the box.
 */
export declare function intersectRayAndBox(point0: Point, point1: Point, box: Box): Point | null;
/**
 * Calculates the intersection of two finite line segments.
 *
 * Segment A is defined by `point0` to `point1`.
 * Segment B is defined by `point2` to `point3`.
 *
 * @param point0 - Start of segment A.
 * @param point1 - End of segment A.
 * @param point2 - Start of segment B.
 * @param point3 - End of segment B.
 * @returns The scalar coefficient `t` (0 to 1) along segment A where the intersection occurs, or `null` if they do not intersect.
 */
export declare function intersectLineSegments(point0: Point, point1: Point, point2: Point, point3: Point): number | null;
/**
 * Clips a finite line segment to a bounding box using the Cohen-Sutherland algorithm.
 *
 * This determines which part of the segment `[p0, p1]` lies inside the box.
 *
 * @param segment - The input segment `[start, end]`.
 * @param box - The clipping boundary.
 * @returns A new {@link Segment} representing the visible portion, a single {@link Point} if clipped to a dot, or `null` if completely outside.
 */
export declare function intersectLineSegmentAndBox(segment: Segment, box: Box): Point | Segment | null;
/**
 * Calculates the shortest (perpendicular) distance from a point to an infinite line.
 *
 * The line is defined by two points, `point1` and `point2`. The target is `point0`.
 *
 * @param point0 - The target point to measure from.
 * @param point1 - First point on the line.
 * @param point2 - Second point on the line.
 * @returns An object containing the `distance` (pixels) and a `coeff` representing the projection of `point0` onto the line vector.
 */
export declare function distanceToLine(point0: Point, point1: Point, point2: Point): {
    distance: number;
    coeff: number;
};
/**
 * Calculates the shortest distance from a point to a finite line segment.
 *
 * Unlike {@link distanceToLine}, this clamps the result to the segment endpoints.
 * If the perpendicular projection falls outside the segment, the distance to the closest endpoint is returned.
 *
 * @param point0 - The target point.
 * @param point1 - Start of the segment.
 * @param point2 - End of the segment.
 * @returns An object containing the `distance` and a `coeff` (0 to 1) indicating the position of the closest point on the segment.
 */
export declare function distanceToSegment(point0: Point, point1: Point, point2: Point): {
    distance: number;
    coeff: number;
};
/**
 * Checks if a point lies strictly inside or on the edge of a bounding box.
 *
 * @param point - The point to test.
 * @param box - The axis-aligned bounding box.
 * @returns `true` if `min.x <= x <= max.x` and `min.y <= y <= max.y`.
 */
export declare function pointInBox(point: Point, box: Box): boolean;
/**
 * Checks if a point lies inside a specific polygon.
 *
 * This implements the **Ray Casting algorithm** (also known as the Even-Odd rule).
 * It shoots a horizontal ray from the test point and counts how many times it intersects
 * the polygon's edges. An odd number of intersections means the point is inside.
 *
 * @param point - The point to test.
 * @param polygon - An array of points defining the polygon vertices.
 * @returns `true` if the point is strictly inside the polygon.
 */
export declare function pointInPolygon(point: Point, polygon: Point[]): boolean;
/**
 * Checks if a point lies inside a triangle defined by three vertices.
 *
 * It uses a barycentric coordinate approach or edge-check logic. Specifically, this implementation
 * checks if the point lies on the same side of all three edges relative to the centroid (or checks intersection against medians).
 *
 * @param point - The point to test.
 * @param end0 - The first vertex.
 * @param end1 - The second vertex.
 * @param end2 - The third vertex.
 * @returns `true` if the point is inside the triangle.
 */
export declare function pointInTriangle(point: Point, end0: Point, end1: Point, end2: Point): boolean;
/**
 * Calculates the exact intersection point of two infinite lines.
 *
 * Uses the general line equation (`Ax + By + C = 0`) determinant method.
 *
 * @param line0 - The first infinite line.
 * @param line1 - The second infinite line.
 * @returns The intersection {@link Point}, or `null` if the lines are parallel (determinant is near zero).
 */
export declare function intersectLines(line0: Line, line1: Line): Point | null;
/**
 * Clips a polygon against a single half-plane using the Sutherland-Hodgman algorithm logic.
 *
 * This is a fundamental step in polygon clipping. It iterates through the polygon edges
 * and outputs a new set of vertices that lie on the "positive" side of the half-plane.
 *
 * @param points - The vertices of the subject polygon.
 * @param halfPlane - The clipping plane.
 * @returns A new array of vertices representing the clipped polygon, or `null` if the result is invalid (fewer than 3 points).
 */
export declare function intersectPolygonAndHalfPlane(points: Point[], halfPlane: HalfPlane): Point[] | null;
/**
 * Checks if a point lies inside or on the boundary of a circle.
 *
 * @param point - The point to test.
 * @param center - The center point of the circle.
 * @param radius - The radius of the circle in pixels.
 * @returns `true` if the distance from the point to the center is less than or equal to the radius.
 */
export declare function pointInCircle(point: Point, center: Point, radius: number): boolean;
/**
 * Extends a line segment infinitely in one or both directions and then clips it to a bounding box.
 *
 * This is the core logic for drawing Rays, Extended Lines, and Horizontal/Vertical lines
 * that must span across the visible chart area.
 *
 * @param point0 - The first control point.
 * @param point1 - The second control point (defines direction).
 * @param width - The width of the clipping area (0 to width).
 * @param height - The height of the clipping area (0 to height).
 * @param extendLeft - If `true`, the line extends infinitely past `point0`.
 * @param extendRight - If `true`, the line extends infinitely past `point1`.
 * @returns A {@link Segment} clipped to the box, a single {@link Point} if clipped to the edge, or `null` if the line misses the box entirely.
 */
export declare function extendAndClipLineSegment(point0: Point, point1: Point, width: number, height: number, extendLeft: boolean, extendRight: boolean): Segment | Point | null;
/**
 * **Time Format Utility: String to Timestamp**
 *
 * Converts a standard ISO Date string (e.g., "2023-01-01") into a UNIX Timestamp (seconds).
 *
 * ### Context
 * Lightweight Charts supports data formats where time is a string (e.g., '2018-12-22').
 * However, the plugin's internal geometry and interpolation math strictly requires
 * numeric values to calculate deltas and intervals.
 *
 * This helper ensures that string-based series data can be consumed by the math engine,
 * utilizing a high-speed cache to eliminate repetitive Date object allocations.
 *
 * @param dateString - The date string to convert.
 * @returns The timestamp in seconds (UTCTimestamp).
 */
export declare function convertDateStringToUTCTimestamp(dateString: string): UTCTimestamp;
/**
 * **Time Format Utility: Timestamp to String**
 *
 * Converts a numeric UNIX Timestamp back into a standard ISO Date string ("YYYY-MM-DD").
 *
 * ### Context
 * This is the inverse of {@link convertDateStringToUTCTimestamp}. It is used when the plugin
 * needs to return a time value that matches the format of the source series data.
 *
 * For example, if the chart is configured with string dates, {@link interpolateTimeFromLogicalIndex}
 * uses this to format its numeric result back into a string so the resulting point matches
 * the series' native data format.
 *
 * @param timestamp - The timestamp in seconds.
 * @returns The formatted date string.
 */
export declare function convertUTCTimestampToDateString(timestamp: UTCTimestamp): string;
/**
 * Converts a Logical Index (including fractional decimals) into a precise pixel Coordinate.
 *
 * **Why this exists:**
 * Lightweight Charts' native `logicalToCoordinate` often returns 0 or fails when passed
 * a decimal index. This helper bypasses that bug by requesting the integer coordinates
 * of the two neighboring candles and manually interpolating the pixel distance.
 *
 * @param timeScale - The chart's TimeScale API.
 * @param index - The fractional logical index.
 * @returns The precise pixel coordinate, or `null` if the index is too far off-chart.
 */
export declare function logicalIndexToCoordinate(timeScale: ITimeScaleApi<any>, index: number): Coordinate | null;
/**
 * **Critical Core Utility: Time Extrapolation (3-Zone Architecture)**
 *
 * Converts a fractional Logical Index into a precise UNIX Timestamp or Date String.
 *
 * ### Performance Architecture:
 * 1. **Zero-Allocation:** This function strictly avoids `series.data()`. By using the
 *    `series.dataByIndex()` API, it points directly to existing objects in the chart's
 *    memory, preventing massive array copies and Garbage Collection (GC) lag
.
 * 2. **Timeframe Immunity:** Within the History Zone, it performs local neighbor interpolation.
 *    This allows a tool drawn on a 1m chart to maintain its exact visual proportions when
 *    viewed on a 15m or 1H chart, regardless of the gap size.
 * 3. **Gap Resilience:** By using local neighbors for interpolation and a verified
 *    interval for extrapolation, this math gracefully glides over weekends and overnight
 *    halts without visual distortion.
 *
 * @typeParam HorzScaleItem - The type of the horizontal scale item (Time, UTCTimestamp, or string).
 * @param chart - The Lightweight Charts API instance.
 * @param series - The series API instance providing the data context.
 * @param logicalIndex - The fractional index to convert into a time value.
 * @returns The extrapolated `Time` matching the series format, or `null` if the series is empty.
 */
export declare function interpolateTimeFromLogicalIndex<HorzScaleItem>(chart: IChartApiBase<HorzScaleItem>, series: ISeriesApi<SeriesType, HorzScaleItem>, logicalIndex: number): Time | null;
/**
 * **Critical Core Utility: Viewport & Culling Price Range**
 *
 * Calculates the absolute visible price range of the specific chart pane
 * where the provided tool is located. It maps the physical top (y=0) and
 * bottom (y=height) pixel edges directly to logical price values.
 *
 * ### Unified Layout Integration
 * This utility utilizes the tool's `getChartDrawingHeight()` method, which is
 * powered by the Core Plugin's unified layout snapshot. This ensures:
 * 1. **Multi-Pane Accuracy:** It correctly calculates the range for sub-panes
 *    (e.g., RSI, Volume) by using pane-specific heights.
 * 2. **Performance:** It is safe to call at 60fps during panning/zooming as it
 *    avoids layout thrashing by reading from a 16ms micro-cache rather than
 *    hitting the DOM directly.
 *
 * @typeParam HorzScaleItem - The type of the horizontal scale item.
 * @param tool - The tool instance providing the series context and access to cached pane dimensions.
 * @returns An object containing `from` (the price at the bottom edge) and `to` (the price at the top edge), or `null` if the series is not yet attached.
 */
export declare function getExtendedVisiblePriceRange<HorzScaleItem>(tool: BaseLineTool<HorzScaleItem>): {
    from: BarPrice | null;
    to: BarPrice | null;
} | null;
/**
 * **Critical Core Utility: Logical Index Recovery (3-Zone Architecture)**
 *
 * Calculates the exact or estimated Logical Index for a specific Timestamp.
 *
 * ### Architecture Benefits:
 * 1. **Zero-Allocation Memory Safety:** This function strictly avoids `series.data()`. By using
 *    the `series.dataByIndex()` API and coordinate mapping, it calculates indices without
 *    copying the chart array into RAM. This ensures high performance even with millions
 *    of bars loaded.
 * 2. **Timeframe Immunity:** By finding the exact left and right neighbor candles for
 *    a timestamp, tools drawn on a lower timeframe (e.g., 1m) will proportionately
 *    float at the correct fractional position on a higher timeframe (e.g., 15m).
 * 3. **Gap Awareness:** This method is immune to weekends and holiday gaps. Because
 *    it searches the actual data array using Binary Search, it glides over empty
 *    time periods without adding phantom indices to the visual representation.
 *
 * @typeParam HorzScaleItem - The type of the horizontal scale item.
 * @param chart - The Lightweight Charts API instance.
 * @param series - The series API instance providing the data context.
 * @param timestamp - The target timestamp to convert into an index.
 * @returns The calculated `Logical` index (including fractions), or `null`.
 */
export declare function interpolateLogicalIndexFromTime<HorzScaleItem>(chart: IChartApiBase<HorzScaleItem>, series: ISeriesApi<SeriesType, HorzScaleItem>, timestamp: Time): Logical | null;
/**
 * Rotates a point around a specific pivot by a given angle.
 *
 * This is essential for rendering rotated text boxes and shapes.
 *
 * @param point - The point to rotate.
 * @param pivot - The center point of rotation.
 * @param angle - The rotation angle in radians (positive values rotate clockwise in canvas coordinates).
 * @returns A new {@link Point} representing the rotated position.
 */
export declare function rotatePoint(point: Point, pivot: Point, angle: number): Point;
