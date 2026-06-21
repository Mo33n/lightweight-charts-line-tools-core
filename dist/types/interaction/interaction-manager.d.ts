import { IChartApiBase, ISeriesApi, SeriesType } from 'lightweight-charts';
import { LineToolsCorePlugin } from '../core-plugin';
import { BaseLineTool } from '../model/base-line-tool';
import { ToolRegistry } from '../model/tool-registry';
import { Point } from '../utils/geometry';
import { LineToolPoint } from '../api/public-api';
/**
 * Manages all user interactions with line tools, including creation, selection,
 * editing, and event propagation. It acts as the central router for mouse
 * and touch events.
 */
export declare class InteractionManager<HorzScaleItem> {
    private _plugin;
    private _chart;
    private _series;
    private _tools;
    private _toolRegistry;
    private _horzScaleBehavior;
    private _currentToolCreating;
    private _selectedTool;
    private _hoveredTool;
    private _isEditing;
    private _draggedTool;
    private _draggedPointIndex;
    private _originalDragPoints;
    private _dragStartPoint;
    private _originalDragLogicalIndices;
    private _activeDragCursor;
    private _isCreationGesture;
    private _creationTool;
    private _mouseDownPoint;
    private _mouseDownTime;
    private _isDrag;
    private _isShiftKeyDown;
    private _lastCrosshairText;
    private _lastCrosshairX;
    private _lastSnapLogical;
    private _lastSnapCandidates;
    /**
     * Lock State — when true, all mouse interactions are suppressed.
     * Tools remain visible but cannot be selected, moved, or drawn.
     * @private
     */
    private _locked;
    /**
     * Tracks the last known chart-relative mouse position.
     * Used to accurately determine which pane the mouse is hovering over,
     * bypassing the resetting Y-coordinates of native crosshair events.
     * @private
     */
    private _currentGlobalPoint;
    /**
     * Flag used to track if our supplemental crosshair time label is currently visible.
     * This is used to throttle requestUpdate() calls, ensuring we only trigger a
     * chart repaint when the label's state actually changes.
     * @private
     */
    private _crosshairSupplementalVisible;
    private _isDestroyed;
    private readonly _boundHandleMouseDown;
    private readonly _boundHandleMouseMove;
    private readonly _boundHandleMouseUp;
    private readonly _boundHandleMouseLeave;
    private readonly _boundHandleDblClick;
    private readonly _boundHandleCrosshairMove;
    private readonly _boundHandleKeyDown;
    private readonly _boundHandleKeyUp;
    /**
     * Initializes the Interaction Manager, setting up all internal references and subscribing
     * to necessary DOM and Lightweight Charts events.
     *
     * This class serves as the central event handler, converting low-level mouse and touch
     * events into logical interaction commands for line tools (e.g., drag, select, create).
     *
     * @param plugin - The root {@link LineToolsCorePlugin} instance for internal updates and event firing.
     * @param chart - The Lightweight Charts chart API instance.
     * @param series - The primary series API instance.
     * @param tools - The map of all registered line tools.
     * @param toolRegistry - The registry for looking up tool constructors.
     */
    constructor(plugin: LineToolsCorePlugin<HorzScaleItem>, chart: IChartApiBase<HorzScaleItem>, series: ISeriesApi<SeriesType, HorzScaleItem>, tools: Map<string, BaseLineTool<HorzScaleItem>>, toolRegistry: ToolRegistry<HorzScaleItem>);
    screenPointToLineToolPoint(screenPoint: Point, bypassMagnet?: boolean): LineToolPoint | null;
    /**
     * Sets the specific tool instance that is currently being drawn interactively by the user.
     *
     * This is called by the {@link LineToolsCorePlugin.addLineTool} method when initiating an
     * interactive creation gesture. This tool instance becomes the target for subsequent mouse clicks.
     *
     * @param tool - The {@link BaseLineTool} instance currently in creation mode, or `null` to clear.
     * @internal
     */
    setCurrentToolCreating(tool: BaseLineTool<HorzScaleItem> | null): void;
    /**
     * Sets the global lock state for all drawing interactions.
     *
     * When locked, all mouse interactions (creation, selection, editing, dragging,
     * hovering) are instantly suppressed. If an interaction is currently in progress
     * when the lock is engaged, it is safely aborted to prevent "ghost" tools from
     * remaining stuck on the screen.
     *
     * @param locked - `true` to lock all interactions, `false` to unlock.
     */
    setLocked(locked: boolean): void;
    /**
     * Returns the current lock state of the Interaction Manager.
     *
     * @returns `true` if interactions are locked, `false` otherwise.
     */
    isLocked(): boolean;
    /**
     * Attaches a line tool primitive to the main series for rendering.
     *
     * This is an internal helper called by the {@link LineToolsCorePlugin} immediately after a tool is constructed.
     *
     * @param tool - The {@link BaseLineTool} to attach.
     * @private
     */
    private attachTool;
    /**
     * Subscribes to all necessary browser DOM events (`mousedown`, `mousemove`, `mouseup`, `keydown`, `keyup`)
     * and Lightweight Charts API events (`subscribeDblClick`, `subscribeCrosshairMove`) to capture user input.
     *
     * @private
     */
    private _subscribeToChartEvents;
    /**
     * Releases all chart, window, and DOM listeners owned by this interaction manager.
     *
     * This method ensures that all event listeners are removed using the exact same
     * references and capturing flags that were used during registration. It also
     * resets active interaction states and severs internal API references to
     * ensure the chart and series can be fully garbage collected.
     *
     * @returns void
     */
    destroy(): void;
    /**
     * Handles global `keydown` and `keyup` events, specifically tracking the state of the 'Shift' key.
     *
     * The Shift key state is critical for enabling constraint-based drawing (e.g., 45-degree angle locking).
     *
     * @param event - The browser's KeyboardEvent.
     * @private
     */
    private _handleKey;
    /**
     * Detaches a line tool primitive from the chart's rendering pipeline and cleans up all internal references to it.
     *
     * This method is called by the {@link LineToolsCorePlugin} when a tool is removed.
     *
     * @param tool - The {@link BaseLineTool} to detach and clean up.
     * @internal
     */
    detachTool(tool: BaseLineTool<HorzScaleItem>): void;
    /**
     * Calculates the "Snapped" Y-coordinate and exact price based on data in the active pane,
     * utilizing a high-performance column cache with a "Live Candle Bypass."
     *
     * ### Precision Fix: The "Native Truth" Pattern
     * To prevent line tools from storing weird floats (e.g., 12.3123 instead of 12.25),
     * this engine now captures the exact numeric price directly from the series data
     * before it is converted to pixels. This object is returned to the caller so
     * that the "Round Trip" (Price -> Pixel -> Price) conversion—which is prone to
     * floating point math errors—is bypassed entirely.
     *
     * ### Efficiency & Real-Time Accuracy
     * To maintain high performance during vertical mouse wiggles, this engine caches
     * candidate snap points for historical candles. However, it explicitly detects
     * if the mouse is over the latest (live) candle in the series.
     *
     * If the candle is "Live," the cache is bypassed, and series data is fetched
     * fresh on every pixel move. This ensures that intra-bar price updates
     * (e.g., a wick growing in real-time) are reflected in the magnet snapping
     * without latency.
     *
     * ### Priority Hierarchy
     * 1. Active Tool `magnetThreshold` (if > 0)
     * 2. Global Plugin `magnetThreshold`
     *
     * @param x - The global screen X coordinate in pixels.
     * @param y - The global screen Y coordinate in pixels.
     * @returns An object containing the snapped Y Coordinate and the exact Price value.
     * @private
     */
    private _getSnappedY;
    /**
     * Finalizes the interactive creation of a tool once its required number of points have been placed.
     *
     * This method performs state cleanup, deselects all other tools, selects the new tool,
     * calls the tool's optional `normalize()` method, and fires the `afterEdit` event.
     *
     * @param tool - The {@link BaseLineTool} that has completed its creation.
     * @private
     */
    private _finalizeToolCreation;
    /**
     * Handles the initial `mousedown` event on the chart canvas.
     *
     * This is the crucial entry point for an interaction gesture, determining if the action is:
     * 1. The start of an interactive tool creation.
     * 2. The start of a drag/edit gesture on an existing tool (dragged anchor or body).
     * 3. An initial click that leads to selection.
     *
     * @param event - The browser's MouseEvent.
     * @private
     */
    private _handleMouseDown;
    /**
     * Handles the `mousemove` event, which primarily manages dragging/editing or ghost-point drawing.
     *
     * This logic handles:
     * 1. Applying drag/edit updates to a selected tool's points, including calculating **Shift-key constraints**.
     * 2. Translating the entire tool if the drag started on the body.
     * 3. Updating the "ghost" point of a tool currently in `Creation` phase.
     * 4. Applying the correct custom cursor style during the drag.
     *
     * @param event - The browser's MouseEvent.
     * @private
     */
    private _handleMouseMove;
    /**
     * Handles the `mouseup` event, finalizing any active interaction (creation or editing).
     *
     * This method is responsible for:
     * 1. Committing the final point in a click-click creation sequence.
     * 2. Finalizing a drag-based creation (e.g., Rectangle, Brush).
     * 3. Finalizing an editing drag (resizing or translation) and resetting the editing state.
     * 4. Handling standalone clicks for selection/deselection.
     *
     * @param event - The browser's MouseEvent.
     * @private
     */
    private _handleMouseUp;
    /**
     * Clears flags related only to a one-time mouse gesture (drag state, mouse position/time).
     *
     * This is used during multi-point creation to reset the interaction flags *without* ending the
     * overall `_currentToolCreating` process.
     *
     * @private
     */
    private _resetCreationGestureStateOnly;
    /**
     * Clears flags and state related to an active tool editing/dragging session.
     *
     * This includes clearing the dragged tool reference, clearing the cursor override, and
     * re-enabling the chart's built-in scroll/pan functionality.
     *
     * @private
     */
    private _resetEditingGestureStateOnly;
    /**
     * Clears the most fundamental mouse gesture state variables: drag flag, mouse down point, and time.
     *
     * @private
     */
    private _resetCommonGestureState;
    /**
     * Performs a complete reset of all interaction state flags, including clearing the tool in creation,
     * deselecting all tools, and requesting a chart update.
     *
     * This is typically used as a fallback for unhandled interactions or external API calls (e.g., context menus).
     *
     * @private
     */
    private _resetInteractionStateFully;
    /**
     * Processes a discrete click that occurred outside of an active creation or editing gesture.
     *
     * This logic handles selection: if a tool was clicked, it becomes selected; otherwise, all tools are deselected.
     *
     * @param point - The screen coordinates of the click event.
     * @private
     */
    private _handleStandaloneClick;
    /**
     * Handles the chart's double-click event broadcast.
     *
     * This method checks for two conditions:
     * 1. **Creation Finalization:** Ends the drawing process for tools that use `FinalizationMethod.DoubleClick` (e.g., Path tool).
     * 2. **Event Firing:** Triggers the public `fireDoubleClickEvent` if an existing tool was hit.
     *
     * @param params - The event parameters provided by Lightweight Charts.
     * @private
     */
    private _handleDblClick;
    /**
     * Handles the chart's crosshair move event, used for hover state and ghost-point drawing.
     *
     * This method:
     * 1. Manages the visual state of the tool currently being created (the "ghosting" point), applying Shift-key constraints.
     * 2. Updates the `_hoveredTool` property and sets its hover state, allowing views to draw hover effects.
     *
     * @param params - The event parameters provided by Lightweight Charts.
     * @private
     */
    private _handleCrosshairMove;
    /**
     * Performs a hit test on all visible line tools, iterating them in reverse Z-order (top-most first).
     *
     * @param point - The screen coordinates to test against all tools.
     * @returns An object containing the hit tool, the hit point index, and the suggested cursor type, or `null` if no tool was hit.
     * @private
     */
    private _hitTest;
    /**
     * Clears the selection state of the currently selected tool, if one exists.
     *
     * This is a public utility often called by the {@link LineToolsCorePlugin} or by the `InteractionManager`'s internal logic.
     *
     * @returns void
     */
    deselectAllTools(): void;
    /**
     * Converts a raw browser `MouseEvent` (which uses screen coordinates) into a chart-relative
     * {@link Point} object (CSS pixels relative to the chart canvas).
     *
     * @param event - The browser's MouseEvent.
     * @returns A chart-relative {@link Point} object, or `null` if the chart element bounding box cannot be retrieved.
     * @private
     */
    private _eventToPoint;
    /**
     * Handles the 'mouseleave' event on the chart container.
     *
     * This is critical for crosshair synchronization. It ensures that when the mouse
     * moves to another chart, this instance's "last known position" is cleared,
     * preventing the passive magnet engine from using stale coordinates.
     *
     * @param event - The browser's MouseEvent.
     * @private
     */
    private _handleMouseLeave;
    /**
     * Determines the vertical offset of the current series' pane.
     *
     * @private
     * @returns The vertical offset in pixels.
     */
    private _getActivePaneYOffset;
    /**
     * Determines the height of the current series' pane.
     *
     * @private
     * @returns The pane height in pixels.
     */
    private _getActivePaneHeight;
    /**
     * Validates if a global Y-coordinate is within the drawing bounds of the active pane.
     *
     * @private
     * @param y - The global Y coordinate relative to the chart container.
     * @returns True if the mouse is in the active pane.
     */
    private _isMouseInActivePane;
    /**
     * Determines the vertical offset for a specific tool's pane.
     *
     * @private
     * @param tool - The specific tool instance being evaluated.
     * @returns The vertical offset in pixels.
     */
    private _getPaneYOffsetForTool;
}
