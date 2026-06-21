import { PriceAxisView } from './price-axis-view';
import { PriceAxisViewRendererCommonData, PriceAxisViewRendererData } from '../types';
import { BaseLineTool } from '../model/base-line-tool';
import { IChartApiBase, Coordinate, ISeriesPrimitiveAxisView } from 'lightweight-charts';
import { PriceAxisLabelStackingManager } from '../model/price-axis-label-stacking-manager';
/**
 * A concrete implementation of a Price Axis View for a specific anchor point of a Line Tool.
 *
 * This class manages the lifecycle of a single price label on the Y-axis. It is responsible for:
 * 1. formatting the price value based on the series configuration.
 * 2. determining visibility based on the tool's interaction state (selected, hovered).
 * 3. interacting with the {@link PriceAxisLabelStackingManager} to prevent label overlaps.
 *
 * @typeParam HorzScaleItem - The type of the horizontal scale item.
 */
export declare class LineToolPriceAxisLabelView<HorzScaleItem> extends PriceAxisView implements ISeriesPrimitiveAxisView {
    private readonly _tool;
    private readonly _pointIndex;
    private readonly _chart;
    private readonly _priceAxisLabelStackingManager;
    private _fixedCoordinate;
    private _isRegistered;
    /**
     * Initializes the price axis label view.
     *
     * @param tool - The parent line tool instance.
     * @param pointIndex - The index of the point in the tool's data array that this label represents.
     * @param chart - The chart API instance.
     * @param priceAxisLabelStackingManager - The manager instance to register this label with for collision resolution.
     */
    constructor(tool: BaseLineTool<HorzScaleItem>, pointIndex: number, chart: IChartApiBase<HorzScaleItem>, priceAxisLabelStackingManager: PriceAxisLabelStackingManager<HorzScaleItem>);
    /**
     * Retrieves the index of the point this label is associated with.
     *
     * Used primarily by the {@link PriceAxisLabelStackingManager} to generate a unique ID
     * for this label (e.g., `ToolID-pIndex`).
     *
     * @returns The zero-based point index.
     */
    getPointIndex(): number;
    /**
     * Callback method used by the {@link PriceAxisLabelStackingManager} to update the label's vertical position.
     *
     * If the stacking manager detects a collision, it calls this method with a new, adjusted Y-coordinate.
     * This method then triggers an immediate chart update to ensure the label is drawn at the new position
     * in the same render frame, preventing visual jitter.
     *
     * @param coordinate - The calculated collision-free Y-coordinate, or `undefined` to use the natural position.
     */
    setFixedCoordinateFromManager(coordinate: Coordinate | undefined): void;
    /**
     * The core logic for updating the renderer's state.
     *
     * This method performs the following tasks:
     * 1. Validates the existence of logical points and API references.
     * 2. Determines interaction-based visibility (excluding hover states).
     * 3. Registers the label with the PriceAxisLabelStackingManager for collision resolution.
     * 4. Configures the final renderer data with high-contrast colors and formatted price strings.
     *
     * @param axisRendererData - The data object for the main axis label.
     * @param paneRendererData - The data object for any pane-side rendering (unused).
     * @param commonData - Shared data (coordinates, colors) between axis and pane renderers.
     */
    protected _updateRendererData(axisRendererData: PriceAxisViewRendererData, paneRendererData: PriceAxisViewRendererData, commonData: PriceAxisViewRendererCommonData): void;
}
