import { User } from "../../user/entities/user.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class Notification implements SCDKResource {
    public resourceType: SCDKResourceType;

    /**
     * Id of the notification.
     */
     public id: string;
 
     /**
      * Title of the notification
      */
     public title: string;
 
     /**
      * Message of the notification.
      */
     public message: string;
 
     /**
      * Set the notification as broadcast. This allows
      * all available users to read the notification.
      */
     public isBroadcast: boolean;
 
     /**
      * List of users that have read the notification.
      * From a technical perspective, this means, the user
      * has requested the resource from one of the endpoints.
      */
     public readBy: User[];
 
     /**
      * List of users that are targeted by the
      * notification. This will be overwritten by
      * the "isBroadcast" property, if set to true.
      */
     public targets: User[];
 
     /**
      * User who triggered the notification.
      * If the sender is null, it means the notification
      * was send by the system.
      */
     public sender: User;
 
     /**
      * Date of delivery of the notification.
      */
     public sentAt: Date;
 
     /**
      * Not a column in the database, but will be populated
      * when requesting resource via service.
      */
     public hasRead: boolean;

}