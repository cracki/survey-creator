import {
  CreatorBase,
  editorLocalization,
  getLocString,
  IQuestionToolboxItem,
  QuestionToolbox
} from "@survey/creator";
import React, { CSSProperties } from "react";
import { ToolboxItemViewModel } from "@survey/creator";
import {
  AdaptiveActionBarItemWrapper,
  AdaptiveElement,
  Base,
  VerticalResponsivityManager,
  SurveyModel
} from "survey-core";
import {
  ReactElementFactory,
  SurveyElementBase,
  SvgIcon
} from "survey-react-ui";
interface ISurveyCreatorToolboxProps {
  toolbox: QuestionToolbox;
  creator: CreatorBase<SurveyModel>;
}

export class SurveyCreatorToolbox extends SurveyElementBase<
  ISurveyCreatorToolboxProps,
  any
> {
  private adaptiveElement = new AdaptiveElement();
  private manager: VerticalResponsivityManager;
  private rootRef: React.RefObject<HTMLDivElement>;

  constructor(props: ISurveyCreatorToolboxProps) {
    super(props);

    this.adaptiveElement.dotsItemPopupModel.horizontalPosition = "right";
    this.adaptiveElement.dotsItemPopupModel.verticalPosition = "top";
    this.adaptiveElement.invisibleItemSelected = this.invisibleItemSelected.bind(
      this
    );
    this.rootRef = React.createRef();
  }
  public get creator() {
    return this.props.creator;
  }
  public get toolbox() {
    return this.props.toolbox;
  }
  private invisibleItemSelected(model: AdaptiveActionBarItemWrapper): void {
    this.creator.clickToolboxItem(
      SurveyCreatorToolbox.getToolboxItem(model).json
    );
  }
  public static getToolboxItem(
    wrapper: AdaptiveActionBarItemWrapper
  ): IQuestionToolboxItem {
    const item: IQuestionToolboxItem = wrapper.wrappedItem as IQuestionToolboxItem;
    return item;
  }
  componentDidMount() {
    super.componentDidMount();
    const container = this.rootRef.current;
    this.manager = new VerticalResponsivityManager(
      container,
      this.adaptiveElement,
      "div.svc-toolbox__tool",
      40
    );
  }
  componentWillUnmount() {
    this.manager.dispose();
    super.componentWillUnmount();
  }

  protected getStateElement(): Base {
    return this.toolbox;
  }
  render(): JSX.Element {
    const sourceItems: Array<IQuestionToolboxItem> = this.props.toolbox.items;
    this.adaptiveElement.items = sourceItems.map(
      (item: IQuestionToolboxItem, itemIndex: number) => {
        return new AdaptiveActionBarItemWrapper(this.adaptiveElement, item);
      }
    );
    if (!this.hasItems) return null;
    const items = this.renderItems();
    return (
      <div ref={this.rootRef} className="svc-toolbox">
        <div className="svc-toolbox__category">{items}</div>
      </div>
    );
  }
  get hasItems(): boolean {
    return (this.adaptiveElement.items || []).length > 0;
  }
  renderToolboxItem(item: AdaptiveActionBarItemWrapper): JSX.Element {
    const className = "svc-toolbox__tool " + item.css;
    const style: CSSProperties = {
      visibility: item.isVisible ? "visible" : "hidden"
    };
    if (item.visible !== undefined && !item.visible) {
      style.display = "none";
    }
    const itemComponent = ReactElementFactory.Instance.createElement(
      item.component || "svc-toolbox-item",
      {
        item: item,
        creator: this.creator
      }
    );
    return (
      <div className={className} style={style} key={item.id}>
        {item.needSeparator ? (
          <div className="svc-toolbox__category-separator"></div>
        ) : null}
        {itemComponent}
      </div>
    );
  }
  renderItems() {
    return this.adaptiveElement.items.map(
      (item: AdaptiveActionBarItemWrapper) => this.renderToolboxItem(item)
    );
  }
}

export interface ISurveyCreatorToolboxItemProps {
  item: AdaptiveActionBarItemWrapper;
  creator: CreatorBase<SurveyModel>;
}

export class SurveyCreatorToolboxItem extends SurveyElementBase<
  ISurveyCreatorToolboxItemProps,
  any
> {
  model: ToolboxItemViewModel;
  constructor(props) {
    super(props);
    const toolboxItem: IQuestionToolboxItem = this.item.wrappedItem as any;
    this.model = new ToolboxItemViewModel(toolboxItem, this.props.creator);
  }
  public get item() {
    return this.props.item;
  }
  public get creator() {
    return this.props.creator;
  }
  protected getStateElement(): Base {
    return this.model;
  }
  render(): JSX.Element {
    const className =
      "svc-toolbox__item svc-toolbox__item--" + this.item.iconName;
    return (
      <div
        className={className}
        tabIndex={0}
        title={this.item.tooltip}
        role="button"
        aria-label={
          this.item.tooltip +
          " " +
          editorLocalization.getString("toolbox") +
          " item"
        }
        onPointerDown={(event: any) => {
          event.persist();
          this.model.onPointerDown(event);
        }}
      >
        <span className="svc-toolbox__item-container">
          <SvgIcon size={24} iconName={this.item.iconName}></SvgIcon>
        </span>
        <span className="svc-toolbox__item-banner">
          <SvgIcon size={24} iconName={this.item.iconName}></SvgIcon>
          <span className="svc-toolbox__item-title">{this.item.title}</span>
        </span>
      </div>
    );
  }
}

ReactElementFactory.Instance.registerElement("svc-toolbox-item", (props) => {
  return React.createElement(SurveyCreatorToolboxItem, props);
});
