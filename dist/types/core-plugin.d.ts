import { IChartApiBase, ISeriesApi, SeriesType, IHorzScaleBehavior, Coordinate, ISeriesPrimitive, SeriesAttachedParameter, PrimitiveHoveredItem } from 'lightweight-charts';
import { ILineToolsApi, LineToolExport, LineToolPoint, LineToolsAfterEditEventHandler, LineToolsDoubleClickEventHandler, LineToolsSingleClickEventHandler } from './api/public-api';
import { LineToolPartialOptionsMap, LineToolType, ITimeAxisView, IPriceAxisView, IPaneView } from './types';
import { BaseLineTool } from './model/base-line-tool';
import { PriceAxisLabelStackingManager } from './model/price-axis-label-stacking-manager';
/**
 * Represents the physical layout and series mapping for a single chart pane.
 *
 * This structure links a specific Lightweight Charts pane to its calculated
 * screen coordinates and the data series it contains.
 */
export interface PaneLayout {
    /** The native Lightweight Charts API reference for the pane. */
    paneApi: any;
    /** The vertical pixel offset (Y-coordinate) from the top of the chart container to the start of this pane. */
    top: number;
    /** The internal drawing height of the pane in pixels, excluding the time scale area. */
    height: number;
    /** A collection of ISeriesApi instances currently residing within this specific pane. */
    series: any[];
}
/**
 * A holistic, point-in-time snapshot of the entire chart's physical dimensions and pane structure.
 *
 * This object serves as the "Single Source of Truth" for layout-dependent calculations
 * (like hit testing and culling), ensuring that dimensions are synchronized across
 * the entire plugin during a single render frame.
 */
export interface ChartLayoutSnapshot {
    /** The high-resolution timestamp (via performance.now()) indicating when this measurement was performed. */
    timestamp: number;
    /** The global drawing width of all chart panes in pixels, accurately excluding the width of the price axis. */
    width: number;
    /** An array containing the individual layout details for every pane currently present in the chart. */
    panes: PaneLayout[];
}
/**
 * The main implementation of the Line Tools Core Plugin.
 *
 * This class acts as the central controller for adding, managing, and interacting with line tools
 * on a Lightweight Chart. It coordinates between the chart's API, the series, and the internal
 * interaction manager to handle user input, rendering, and state management of drawing tools.
 *
 * While typically initialized via the `createLineToolsPlugin` factory, this class implements
 * the {@link ILineToolsApi} interface which defines the primary methods available to consumers.
 *
 * @typeParam HorzScaleItem - The type of the horizontal scale item (e.g., `Time`, `UTCTimestamp`, or `number`), matching the chart's configuration.
 */
export declare class LineToolsCorePlugin<HorzScaleItem> implements ILineToolsApi, ISeriesPrimitive<HorzScaleItem> {
    private readonly _chart;
    private readonly _series;
    private readonly _horzScaleBehavior;
    private _tools;
    private readonly _toolRegistry;
    private readonly _interactionManager;
    private readonly _priceAxisLabelStackingManager;
    private readonly _crosshairTimeView;
    private _layoutSnapshot;
    /**
     * Retrieves a unified layout snapshot of the entire chart.
     *
     * ### Performance
     * If the snapshot is less than 16ms old (approx. 1 frame), it returns the
     * cached version. Otherwise, it performs a single, holistic measurement
     * of all panes and dimensions.
     *
     * @returns The current {@link ChartLayoutSnapshot}.
     */
    getLayout(): ChartLayoutSnapshot;
    /**
     * Optional user-provided function for formatting time axis labels.
     * @private
     */
    private _customTimeFormatter;
    /**
     * The pixel tolerance for the magnetic snapping engine (0 = disabled).
     * This value acts as the global default for all line tools.
     * @private
     */
    private _magnetThreshold;
    private readonly _doubleClickDelegate;
    private readonly _afterEditDelegate;
    private readonly _selectSingleClickDelegate;
    private _stackingUpdateScheduled;
    private _isDestroyed;
    constructor(chart: IChartApiBase<HorzScaleItem>, series: ISeriesApi<SeriesType, HorzScaleItem>, horzScaleBehavior: IHorzScaleBehavior<HorzScaleItem>);
    /**
     * Requests a redraw of the chart.
     *
     * This method is the primary mechanism for internal components (like the {@link InteractionManager} or individual tools)
     * to trigger a render cycle after state changes (e.g., hovering, selecting, or modifying a tool).
     * It effectively calls `chart.applyOptions({})` to signal that the primitives need repainting.
     *
     * @internal
     * @returns void
     */
    requestUpdate(): void;
    /**
     * Registers a custom line tool class with the plugin.
     *
     * Before a specific tool type (e.g., 'Rectangle', 'FibRetracement') can be created via
     * {@link addLineTool} or {@link importLineTools}, its class constructor must be registered here.
     * This maps a string identifier to the actual class implementation.
     *
     * @param type - The unique string identifier for the tool type (e.g., 'Rectangle').
     * @param toolClass - The class constructor for the tool, which must extend {@link BaseLineTool}.
     * @returns void
     *
     * @example
     * import { LineToolRectangle } from './my-tools/rectangle';
     * plugin.registerLineTool('Rectangle', LineToolRectangle);
     */
    registerLineTool(type: LineToolType, toolClass: new (...args: any[]) => BaseLineTool<HorzScaleItem>): void;
    /**
     * Adds a new line tool to the chart.
     *
     * If `points` is provided, the tool is drawn immediately at those coordinates.
     * If `points` is an empty array, `null`, or undefined, the plugin enters
     * **interactive creation mode**, allowing the user to click on the chart to draw the tool.
     *
     * @param type - The type of line tool to create (e.g., 'TrendLine', 'Rectangle').
     * @param points - An array of logical points (timestamp/price) to define the tool. Pass `[]` to start interactive drawing.
     * @param options - Optional configuration object to customize the tool's appearance (line color, width, etc.).
     * @returns The unique string ID of the newly created tool.
     *
     * @example
     * // Start drawing a Trend Line interactively (user clicks to place points)
     * plugin.addLineTool('TrendLine');
     *
     * @example
     * // Programmatically add a Rectangle at specific coordinates
     * plugin.addLineTool('Rectangle', [
     *   { timestamp: 1620000000, price: 100 },
     *   { timestamp: 1620086400, price: 120 }
     * ], {
     *   line: { color: '#ff0000', width: 2 },
     *   background: { color: 'rgba(255, 0, 0, 0.2)' }
     * });
     */
    addLineTool<T extends LineToolType>(type: T, points?: LineToolPoint[] | null, options?: LineToolPartialOptionsMap[T] | undefined): string;
    /**
     * Creates a new line tool with a specific ID, or updates it if that ID already exists.
     *
     * Unlike `addLineTool`, this method requires a specific ID. It is primarily used for
     * state synchronization (e.g., `importLineTools`) where preserving the original tool ID is critical.
     *
     * @param type - The type of the line tool.
     * @param points - The points defining the tool.
     * @param options - The configuration options.
     * @param id - The unique ID to assign to the tool (or the ID of the tool to update).
     * @returns void
     */
    createOrUpdateLineTool<T extends LineToolType>(type: T, points: LineToolPoint[], options: LineToolPartialOptionsMap[T], id: string): void;
    /**
     * Removes one or more line tools from the chart based on their unique IDs.
     *
     * @param ids - An array of unique string IDs representing the tools to remove.
     * @returns void
     *
     * @example
     * plugin.removeLineToolsById(['tool-id-1', 'tool-id-2']);
     */
    removeLineToolsById(ids: string[]): void;
    /**
     * Removes all line tools whose IDs match the provided Regular Expression.
     *
     * This allows for bulk deletion of tools based on naming patterns (e.g., removing all tools tagged with 'temp-').
     *
     * @param regex - The Regular Expression to match against tool IDs.
     * @returns void
     *
     * @example
     * // Remove all tools starting with "drawing-"
     * plugin.removeLineToolsByIdRegex(/^drawing-/);
     */
    removeLineToolsByIdRegex(regex: RegExp): void;
    /**
     * Removes the currently selected line tool(s) from the chart.
     *
     * This is typically wired to a keyboard shortcut (like the Delete key) or a UI button
     * to allow users to delete the specific tool they are interacting with.
     *
     * @returns void
     */
    removeSelectedLineTools(): void;
    /**
     * Removes all line tools managed by this plugin from the chart.
     *
     * This performs a full cleanup, detaching every tool from the chart's series and
     * releasing associated resources.
     *
     * @returns void
     */
    removeAllLineTools(): void;
    /**
     * Retrieves the data for all line tools that are currently selected by the user.
     *
     * @returns A JSON string representing an array of the selected tools' data.
     *
     * @example
     * const selected = JSON.parse(plugin.getSelectedLineTools());
     * console.log(`User has selected ${selected.length} tools.`);
     */
    getSelectedLineTools(): string;
    /**
     * Retrieves the data for a specific line tool by its unique ID.
     *
     * @param id - The unique identifier of the tool to retrieve.
     * @returns A JSON string representing an array containing the single tool's data, or an empty array `[]` if the ID was not found.
     *
     * @remarks
     * The return type is a JSON string to maintain compatibility with the V3.8 API structure.
     * You will typically need to `JSON.parse()` the result to work with the data programmatically.
     */
    getLineToolByID(id: string): string;
    /**
     * Retrieves a list of line tools whose IDs match a specific Regular Expression.
     *
     * This is useful for grouping tools by naming convention (e.g., fetching all tools with IDs starting with 'trend-').
     *
     * @param regex - The Regular Expression to match against tool IDs.
     * @returns A JSON string representing an array of all matching line tools.
     *
     * @example
     * // Get all tools with IDs starting with "fib-"
     * const tools = plugin.getLineToolsByIdRegex(/^fib-/);
     */
    getLineToolsByIdRegex(regex: RegExp): string;
    /**
     * Applies new configuration options or points to an existing line tool.
     *
     * This method is used to dynamically update a tool's appearance or position after it
     * has been created. It performs a partial merge, so you only need to provide the properties
     * you wish to change.
     *
     * Note: If the tool is currently selected, it will be deselected upon update to ensure visual consistency.
     *
     * @param toolData - An object containing the tool's `id`, `toolType`, and the `options` or `points` to update.
     * @returns `true` if the tool was found and updated, `false` otherwise (e.g., ID not found or type mismatch).
     *
     * @example
     * // Change the color of an existing tool to blue
     * plugin.applyLineToolOptions({
     *   id: 'existing-tool-id',
     *   toolType: 'TrendLine',
     *   options: {
     *     line: { color: 'blue' }
     *   },
     *   points: [] // Points can be omitted if not changing
     * });
     */
    applyLineToolOptions<T extends LineToolType>(toolData: LineToolExport<T>): boolean;
    /**
     * Serializes the state of all currently drawn line tools into a JSON string.
     *
     * This export format is compatible with `importLineTools` and the V3.8 line tools plugin,
     * making it suitable for saving chart state to a database or local storage.
     *
     * @returns A JSON string representing an array of all line tools and their current state.
     *
     * @example
     * const savedState = plugin.exportLineTools();
     * localStorage.setItem('my-chart-tools', savedState);
     */
    exportLineTools(): string;
    /**
     * Imports a set of line tools from a JSON string.
     *
     * This method parses the provided JSON (typically generated by {@link exportLineTools}) and
     * creates or updates the tools on the chart.
     *
     * **Note:** This is a non-destructive import. It will not remove existing tools unless
     * the imported data overwrites them by ID. It creates new tools if the IDs do not exist
     * and updates existing ones if they do.
     *
     * @param json - A JSON string containing an array of line tool export data.
     * @returns `true` if the import process completed successfully, `false` if the JSON was invalid.
     */
    importLineTools(json: string): boolean;
    /**
     * Retrieves the series data rows within a specified time range.
     *
     * @param range - An object containing the 'from' and 'to' timestamps or date strings.
     * @returns An array of native series data objects (e.g., OHLC) found within the requested range.
     */
    getDataInRange(range: {
        from: number | string;
        to: number | string;
    }): any[];
    /**
     * Retrieves a single data row at a specific timestamp.
     *
     * @param time - The timestamp or business day string to look up.
     * @returns The data object if an exact match is found, otherwise `null`.
     */
    getBarAtTime(time: number | string): any | null;
    /**
     * Finds the data row closest to a target timestamp based on the provided search mode.
     * Useful for cross-timeframe syncing (e.g., finding a 15m candle from a 1m timestamp).
     *
     * @param time - The target timestamp or business day string.
     * @param mode - The search strategy ('exact', 'floor', 'ceil', or 'nearest').
     * @returns The data object matching the criteria, or `null`.
     */
    getClosestBar(time: number | string, mode: 'exact' | 'floor' | 'ceil' | 'nearest'): any | null;
    /**
     * Retrieves the data row located at a specific pixel coordinate on the chart.
     *
     * @param x - The X-coordinate (in pixels) relative to the chart canvas.
     * @returns The data object corresponding to the bar under the coordinate, or `null`.
     */
    getBarAtCoordinate(x: number): any | null;
    /**
     * Retrieves the first (earliest) data row currently loaded in the series.
     *
     * ### Performance Note:
     * Uses $O(1)$ lookup via `dataByIndex` with `MismatchDirection.NearestRight` (1).
     * This completely avoids loading the series data array into memory, maintaining 144+ FPS.
     *
     * @returns The earliest data object, or `null` if the series is empty.
     */
    getEarliestBar(): any | null;
    /**
     * Retrieves the last (most recent) data row currently loaded in the series.
     *
     * ### Performance Note:
     * Uses $O(1)$ lookup via `dataByIndex` with `MismatchDirection.NearestLeft` (-1).
     *
     * @returns The most recent data object, or `null` if the series is empty.
     */
    getLatestBar(): any | null;
    /**
     * Retrieves the full time range covered by the currently loaded series data.
     *
     * ### Performance Note:
     * Uses the optimized endpoint lookups to instantly determine the bounds
     * without iterating or allocating the dataset.
     *
     * @returns An object with 'from' and 'to' timestamps, or `null` if the series is empty.
     */
    getFullTimeRange(): {
        from: any;
        to: any;
    } | null;
    /**
     * Subscribes a callback function to the "Double Click" event.
     *
     * This event fires whenever a user double-clicks on an existing line tool.
     * It is often used to open custom settings modals or perform specific actions on the tool.
     *
     * @param handler - The function to execute when the event fires. Receives {@link LineToolsDoubleClickEventParams}.
     * @returns void
     */
    subscribeLineToolsDoubleClick(handler: LineToolsDoubleClickEventHandler): void;
    /**
     * Unsubscribes a previously registered callback from the "Double Click" event.
     *
     * @param handler - The specific callback function that was passed to {@link subscribeLineToolsDoubleClick}.
     * @returns void
     */
    unsubscribeLineToolsDoubleClick(handler: LineToolsDoubleClickEventHandler): void;
    /**
     * Subscribes a callback function to the "After Edit" event.
     *
     * This event fires whenever a line tool is:
     * 1. Modified (points moved or properties changed).
     * 2. Finished creating (the final point was placed).
     *
     * @param handler - The function to execute when the event fires. Receives {@link LineToolsAfterEditEventParams}.
     * @returns void
     *
     * @example
     * plugin.subscribeLineToolsAfterEdit((params) => {
     *   console.log('Tool edited:', params.selectedLineTool.id);
     *   console.log('Edit stage:', params.stage);
     * });
     */
    subscribeLineToolsAfterEdit(handler: LineToolsAfterEditEventHandler): void;
    /**
     * Unsubscribes a previously registered callback from the "After Edit" event.
     *
     * Use this to stop listening for tool creation or modification events, typically during
     * component cleanup or when the chart is being destroyed.
     *
     * @param handler - The specific callback function that was passed to {@link subscribeLineToolsAfterEdit}.
     * @returns void
     */
    unsubscribeLineToolsAfterEdit(handler: LineToolsAfterEditEventHandler): void;
    /**
     * Subscribes a callback function to the "Single Click" selection event.
     *
     * This event fires when a tool is selected or when the current selection is cleared.
     *
     * @param handler - The function to execute when the event fires. Receives {@link LineToolsSingleClickEventParams}.
     * @returns void
     */
    subscribeLineToolsSingleClick(handler: LineToolsSingleClickEventHandler): void;
    /**
     * Unsubscribes a previously registered callback from the "Single Click" selection event.
     *
     * @param handler - The specific callback function that was passed to {@link subscribeLineToolsSingleClick}.
     * @returns void
     */
    unsubscribeLineToolsSingleClick(handler: LineToolsSingleClickEventHandler): void;
    /**
     * Sets the crosshair position to a specific pixel coordinate (x, y) on the chart.
     *
     * @param x - The x-coordinate (in pixels).
     * @param y - The y-coordinate (in pixels).
     * @param visible - Controls the visibility.
     * @param providedTime - Optional. The logical time value.
     * @param providedPrice - Optional. The logical price value.
     * @returns void
     */
    setCrossHairXY(x: number | null, y: number | null, visible: boolean, providedTime?: HorzScaleItem, providedPrice?: number): void;
    /**
     * Clears the chart's crosshair, making it invisible.
     *
     * This acts as a proxy for the underlying Lightweight Charts API `clearCrosshairPosition()`.
     * Use this to programmatically hide the crosshair (e.g., when the mouse leaves a custom container).
     *
     * @returns void
     */
    clearCrossHair(): void;
    /**
     * Updates the state of the supplemental crosshair time axis label.
     *
     * This is used internally by the InteractionManager to draw the crosshair
     * label in the "blank space" where Lightweight Charts natively hides it.
     *
     * @param text - The formatted time string.
     * @param x - The X coordinate in pixels.
     * @param visible - Whether the supplemental label should be shown.
     * @internal
     */
    updateCrosshairTimeLabel(text: string, x: Coordinate, visible: boolean): void;
    /**
     * Sets the magnet threshold in pixels for snapping to price data.
     *
     * This value serves as the global default. Setting this will trigger a redraw
     * to ensure any active ghost points or crosshairs immediate reflect the new
     * snapping strength.
     *
     * @param pixels - The snapping tolerance in pixels.
     */
    setMagnetThreshold(pixels: number): void;
    /**
     * Retrieves the current global magnet threshold.
     *
     * This is used by the InteractionManager to determine the default
     * snapping behavior when a tool does not provide its own override.
     *
     * @internal
     * @returns The threshold in pixels.
     */
    getMagnetThreshold(): number;
    /**
     * Converts screen coordinates to logical time and price using the plugin's
     * internal interpolation and snapping engine.
     *
     * @param x - Pixel X.
     * @param y - Pixel Y.
     * @returns The logical point.
     */
    getLogicalPoint(x: number, y: number): LineToolPoint | null;
    /**
     * Configures a custom formatter for the time labels.
     *
     * [v1.1 MASTER SETTER]
     * This method acts as a synchronization proxy. It updates the chart's native
     * localization while storing the formatter for the plugin's internal
     * "Gap Repair" engine. By updating both, we ensure that the crosshair
     * looks identical over data candles (handled by the chart) and in the
     * blank space (handled by the plugin).
     *
     * @param formatter - The formatting function, or null to revert to defaults.
     */
    setTimeFormatter(formatter: ((time: any) => string) | null): void;
    /**
     * Retrieves the currently active custom time formatter.
     *
     * @internal
     * @returns The formatter function, or `null` if none is set.
     */
    getTimeFormatter(): ((time: any) => string) | null;
    /**
     * Sets the global interaction lock state for the plugin.
     *
     * This implementation delegates the state management to the InteractionManager.
     * If the chart is being locked, the manager will also handle the safety cleanup
     * of any currently selected tools or active drawing gestures to ensure the
     * UI doesn't get "stuck."
     *
     * @param locked - `true` to disable all drawing and editing, `false` to restore interaction.
     */
    setLocked(locked: boolean): void;
    /**
     * Returns the current interaction lock state of the plugin.
     *
     * @returns `true` if drawings are currently in read-only mode.
     */
    isLocked(): boolean;
    /**
     * Completely destroys the line tools plugin instance and cleans up all associated memory.
     *
     * This orchestrates a "Full Uninstall" sequence:
     * 1. Safely removes all active drawing tools and clears their individual states.
     * 2. Unbinds all internal mouse/keyboard event listeners in the Interaction Manager.
     * 3. Clears all event delegates to release user-provided callbacks from memory.
     * 4. Detaches the core plugin itself from the rendering engine.
     * 5. Transforms the instance into a no-op dummy by overwriting its own API methods.
     * 6. Severs all internal references to the chart and series to allow garbage collection.
     *
     * @returns void
     */
    destroy(): void;
    /**
     * Broadcasts an event indicating that a line tool has been double-clicked.
     *
     * This method is called internally by the {@link InteractionManager} upon detecting a double-click
     * interaction on a tool. It triggers listeners subscribed via {@link subscribeLineToolsDoubleClick}.
     *
     * @internal
     * @param tool - The tool instance that was double-clicked.
     * @returns void
     */
    fireDoubleClickEvent(tool: BaseLineTool<HorzScaleItem>): void;
    /**
     * Broadcasts an event indicating that a line tool's selection state has changed.
     *
     * This method constructs a predictive payload where keys are always present,
     * but geometric and style data is set to null during a 'deselected' state
     * to ensure the payload remains lightweight.
     *
     * @internal
     * @param tool - The tool instance whose state changed.
     * @param selectionState - The new state of the tool ('selected' or 'deselected').
     * @returns void
     */
    fireSingleClickEvent(tool: BaseLineTool<HorzScaleItem>, selectionState: 'selected' | 'deselected'): void;
    /**
     * Broadcasts an event indicating that a line tool has been modified or created.
     *
     * This method is primarily called internally by the {@link InteractionManager} when a user
     * finishes drawing or editing a tool. It triggers any listeners subscribed via
     * {@link subscribeLineToolsAfterEdit}.
     *
     * @internal
     * @param tool - The tool instance that was edited.
     * @param stage - The stage of the edit action (e.g., 'lineToolEdited' for modification, 'lineToolFinished' for creation).
     * @returns void
     */
    fireAfterEditEvent(tool: BaseLineTool<HorzScaleItem>, stage: 'lineToolEdited' | 'pathFinished' | 'lineToolFinished'): void;
    /**
     * Retrieves the instance of the Price Axis Label Stacking Manager.
     *
     * This manager is responsible for preventing overlap between the price labels of different tools
     * on the Y-axis. This accessor is primarily used internally by {@link BaseLineTool} to register its labels.
     *
     * @internal
     * @returns The shared {@link PriceAxisLabelStackingManager} instance.
     */
    getPriceAxisLabelStackingManager(): PriceAxisLabelStackingManager<HorzScaleItem>;
    /**
     * Implementation of ISeriesPrimitive. Returns the views for the time axis.
     */
    timeAxisViews(): readonly ITimeAxisView[];
    /**
     * Optional Z-Order implementation for the plugin primitive.
     * This ensures our injected crosshair label stays on the topmost layer.
     */
    zOrder(): 'top' | 'normal' | 'bottom';
    /**
     * Implementation of ISeriesPrimitive. We don't render anything on the price axis for the core itself.
     */
    priceAxisViews(): readonly IPriceAxisView[];
    /**
     * Implementation of ISeriesPrimitive. We don't render anything on the main pane.
     */
    paneViews(): readonly IPaneView[];
    /**
     * Implementation of ISeriesPrimitive. The core itself does not capture mouse hits.
     */
    hitTest(): PrimitiveHoveredItem | null;
    /**
     * Implementation of ISeriesPrimitive. Triggers when attached to a series.
     */
    attached(param: SeriesAttachedParameter<HorzScaleItem>): void;
    /**
     * Implementation of ISeriesPrimitive. Triggers when detached.
     */
    detached(): void;
    /**
     * Implementation of ISeriesPrimitive. Signals that views need updating.
     */
    updateAllViews(): void;
    /**
     * Internal factory method to instantiate and register a new tool.
     *
     * This handles the common logic for `addLineTool`, `createOrUpdateLineTool`, and `importLineTools`,
     * including checking the registry, creating the instance, attaching it to the series, and
     * managing interactive state if required.
     *
     * @param type - The tool type identifier.
     * @param points - The initial points for the tool.
     * @param options - Optional configuration options.
     * @param id - Optional specific ID (if not provided, the tool generates its own).
     * @param initiateInteractive - If `true`, sets the tool to "Creating" mode and updates the InteractionManager.
     * @returns The newly created `BaseLineTool` instance.
     * @throws Error if the tool type is not registered.
     * @private
     */
    private _createAndAddTool;
    /**
     * Core Binary Search Engine: Finds the index of a bar based on its timestamp key.
     *
     * Supports optimized lookup modes for crosshair synchronization and range fetching.
     * Time complexity: O(log n)
     *
     * @private
     * @param targetKey - The numeric timestamp key to search for.
     * @param mode - The search mode ('exact', 'floor', 'ceil', or 'nearest').
     * @returns The index of the matching bar in the series data array, or -1 if not found.
     */
    private _findBarIndex;
}
