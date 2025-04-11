import { isNull } from "@repo/utilities";
import { BehaviorSubject, Observable, Subject, catchError, distinctUntilChanged, of, take } from "rxjs";

export enum ScComponentActionResult {
  /**
   * The action has completed with
   * no errors
   */
  COMPLETED = "completed",
  /**
   * Errors occured while executing
   * the action-callback
   */
  FAILED = "failed"
}

export class ScComponentAction {
  /** @ignore */
  private _isDone: boolean = false;
  /** @ignore */
  private readonly _isRunning = new BehaviorSubject(false);
  /**
   * Observable to subscribe to
   * is running state changes
   */
  public readonly $isRunning = this._isRunning.asObservable().pipe(distinctUntilChanged());
  /**
   * Create a new component action based
   * on a parent action to create a propagation chain.
   * Marking the new action as done
   * @param action Parent action from which the new action extends from
   * @returns Instance to component action
   */
  public static from(action: ScComponentAction): ScComponentAction {
    // Create new action from parent
    return new ScComponentAction(action.nativeEvent, action);
  }
  /**
   * Create a new component action
   * @param event Native browser event instance
   * @returns Instance to component action
   */
  public static create(nativeEvent: PointerEvent): ScComponentAction {
    return new ScComponentAction(nativeEvent);
  }
  private constructor(
    /**
     * Instance of the
     * native browser event
     * that fired this component action
     */
    public readonly nativeEvent: PointerEvent,
    /** @ignore */
    private readonly _fromAction?: ScComponentAction
  ) { }

  /**
   * Provide a subject to which the action
   * can subscribe. This subscription is used
   * to detect when the action is allowed to resolve and
   * can safely be marked as `done`.
   * NOTE: Only the first emitted value will be considered
   * @param task Subject/Observable to which the action subscribes. Any given subject/observable can either emit `void` or the reason for the completion.
   */
  public runUntil(task: Subject<ScComponentActionResult | void> | Observable<ScComponentActionResult | void>): void {
    this._isRunning.next(true);
    task
      .pipe(
        take(1),
        catchError(() => {
          return of(ScComponentActionResult.FAILED);
        })
      )
      .subscribe((reason?: ScComponentActionResult | void) => {
        if (typeof reason === "string") {
          this._done(reason ?? ScComponentActionResult.COMPLETED);
        } else {
          this._done();
        }

        // Complete the task, if
        // it is a subject
        if (task instanceof Subject) {
          task.complete();
        }
      });
  }
  /**
   * Mark the action as done.
   * You can specify a reason to tell the
   * emitting component how the action-callback
   * ended. Components may act differently with
   * this information and show some feedback in the UI
   * @param reason Reason why the action is marked as done. For example the action is done because the callback completed successfully. Defaults to `completed`
   */
  protected _done(reason?: ScComponentActionResult): void {
    const validatedCompletionReason = reason ?? ScComponentActionResult.COMPLETED;

    // Check if action already marked
    // as done
    if (this._isDone) {
      console.warn(
        `[ScComponentAction] done() has been called more than once on the same action. This can cause unexpected behaviour.`
      );
    }

    // Mark as done
    this._markAsDone();
    // Mark as not running
    this._isRunning.next(false);
    this._isRunning.complete();
    // Mark the parent
    // action as done as well
    if (!isNull(this._fromAction)) {
      this._fromAction._done(validatedCompletionReason);
    }
    return;
  }
  /**
   * Mark the action as done
   * @ignore
   */
  private _markAsDone(): void {
    this._isDone = true;
  }
}
