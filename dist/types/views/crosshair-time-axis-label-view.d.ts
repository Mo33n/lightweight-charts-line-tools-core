import { IChartApiBase, Coordinate } from 'lightweight-charts';
import { ITimeAxisView, ITimeAxisViewRenderer } from '../types';
/**
 * A supplemental Time Axis View used to render the crosshair label in the "blank space".
 *
 * Lightweight Charts v5 natively hides the crosshair time label if the timestamp
 * does not exist in the series data. This class allows the Core Plugin to
 * manually inject a label that looks identical to the native one, ensuring
 * a seamless experience when drawing tools into the future.
 *
 * @typeParam HorzScaleItem - The type of the horizontal scale item used by the chart.
 */
export declare class CrosshairTimeAxisLabelView<HorzScaleItem> implements ITimeAxisView {
    private readonly _chart;
    private readonly _timeScale;
    private readonly _renderer;
    private readonly _rendererData;
    private _invalidated;
    /**
     * Initializes the crosshair time axis label view.
     *
     * @param chart - The chart API instance for accessing options and formatting.
     */
    constructor(chart: IChartApiBase<HorzScaleItem>);
    /**
     * Updates the visual state of the supplemental label.
     *
     * @param text - The formatted date/time string to display.
     * @param coordinate - The pixel X-coordinate where the label should be centered.
     * @param visible - Whether the supplemental label should be drawn.
     */
    updateState(text: string, coordinate: Coordinate, visible: boolean): void;
    /**
     * Defines the Z-Order for this specific view.
     * By returning 'top', we ensure the supplemental crosshair label sits
     * above line tools and series data, matching the native crosshair behavior.
     */
    zOrder(): 'top' | 'normal' | 'bottom';
    /**
     * Implementation of ITimeAxisView. Returns the renderer.
     */
    getRenderer(): ITimeAxisViewRenderer;
    /**
     * Implementation of ITimeAxisView. Notifies the view that data is dirty.
     */
    update(): void;
    /**
     * Returns the current text content of the label.
     */
    text(): string;
    /**
     * Returns the X-coordinate of the label.
     */
    coordinate(): Coordinate;
    /**
     * Returns the calculated text color.
     */
    textColor(): string;
    /**
     * Returns the background color of the label tag.
     */
    backColor(): string;
    /**
     * Returns whether the supplemental label is currently visible.
     */
    visible(): boolean;
}
